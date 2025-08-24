import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

export type DepositData = {
  recipient: string;
  sol: string;
  solanaPayUrl: string;
};

export function useDeposit(
  usd: number,
  userId: number,
  idempotencyKey?: string
) {
  const [data, setData] = useState<DepositData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const storageKey = `deposit_idempotency_${userId}_${usd}`;

        if (idempotencyKey) {
          const res = await axios.get(`/api/deposit/${idempotencyKey}`);
          if (!mounted) return;
          setData({
            recipient: res.data.recipient,
            sol: res.data.sol,
            solanaPayUrl: res.data.solanaPayUrl,
          });
          return;
        }

        let key = localStorage.getItem(storageKey);
        if (!key) {
          key = crypto.randomUUID();
          localStorage.setItem(storageKey, key);
        }

        const res = await axios.post(
          "/api/deposit",
          { usd },
          {
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": key,
            },
          }
        );

        if (!mounted) return;
        setData({
          recipient: res.data.recipient,
          sol: res.data.sol,
          solanaPayUrl: res.data.solanaPayUrl,
        });
      } catch (e) {
        const err = e as AxiosError<{ error?: string }>;
        setError(err.response?.data?.error ?? "Unknown error");
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [usd, userId, idempotencyKey]);

  return { data, loading, error };
}
