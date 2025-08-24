import { useCallback, useState } from "react";
import axios from "axios";
import { getReferenceFromUrl } from "@/lib/url/url";
import { TransactionCheckedReturn } from "@/types/api";

export function useTransaction() {
  const [sending, setSending] = useState(false);

  const checkTransaction = useCallback(
    async (fallbackSolanaPayUrl?: string, fallbackUsd?: number) => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (!params.get("reference") && fallbackSolanaPayUrl) {
          const ref = getReferenceFromUrl(fallbackSolanaPayUrl);
          if (ref) params.set("reference", ref);
        }
        if (!params.get("usd") && typeof fallbackUsd === "number") {
          params.set("usd", String(fallbackUsd));
        }

        const res = await axios.get<TransactionCheckedReturn>(
          `/api/transaction/check?${params.toString()}`
        );
        const data: TransactionCheckedReturn = res.data;
        return data;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const sendTransaction = useCallback(async (solanaPayUrl?: string) => {
    if (!solanaPayUrl) throw new Error("missing solanaPayUrl");
    try {
      setSending(true);
      const urlObj = new URL(solanaPayUrl);
      const amountStr = urlObj.searchParams.get("amount");
      const reference = urlObj.searchParams.get("reference") ?? undefined;
      const amount = amountStr ? Number(amountStr) : 0;

      const res = await axios.post("/api/transaction", {
        amountSol: amount,
        reference,
      });
      return res.data;
    } finally {
      setSending(false);
    }
  }, []);

  return { sending, checkTransaction, sendTransaction };
}
