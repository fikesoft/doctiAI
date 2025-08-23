"use client";

import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { SiSolana } from "react-icons/si";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import useAppDispatch from "@/store/hooks/useDispatch";
import { pushToast } from "@/store/slices/toast";
import { useRouter } from "next/navigation";

export default function CryptoClient({
  usd,
  userId,
  idempotencyKey,
}: {
  usd: number;
  userId: number;
  idempotencyKey?: string;
}) {
  const [recipient, setRecipient] = useState<string | null>(null);
  const [solAmount, setSolAmount] = useState<string | null>(null);
  const [solanaPayUrl, setSolanaPayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false); // loading state for button
  const session = useSession();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (idempotencyKey) {
          const res = await axios.get(`/api/deposit/${idempotencyKey}`);
          setRecipient(res.data.recipient);
          setSolAmount(res.data.sol);
          setSolanaPayUrl(res.data.solanaPayUrl);
        } else {
          const storageKey = `deposit_idempotency_${userId}_${usd}`;
          let idempotencyKey = localStorage.getItem(storageKey);
          if (!idempotencyKey) {
            idempotencyKey = crypto.randomUUID();
            localStorage.setItem(storageKey, idempotencyKey);
          }

          const res = await axios.post(
            "/api/deposit",
            { usd },
            {
              headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey,
              },
            }
          );

          setRecipient(res.data.recipient);
          setSolAmount(res.data.sol);
          setSolanaPayUrl(res.data.solanaPayUrl);
        }
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        const message = err.response?.data?.error ?? "Unknown error";

        console.error(message);
        dispatch(
          pushToast({
            messageToast: message,
            headerToast: "error",
          })
        );

        setRecipient(null);
        setSolAmount(null);
        setSolanaPayUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usd, userId, idempotencyKey, dispatch]);

  useEffect(() => {
    if (!solanaPayUrl) return;

    const urlObj = new URL(solanaPayUrl);
    const referenceStr = urlObj.searchParams.get("reference");
    if (!referenceStr) return;

    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("reference", referenceStr);

    router.replace(`${window.location.pathname}?${currentParams.toString()}`);
  }, [solanaPayUrl, router]);

  const handleCheckTransaction = async () => {
    try {
      // use current query params, fallback to solanaPayUrl and prop usd
      const params = new URLSearchParams(window.location.search);

      if (!params.get("reference") && solanaPayUrl) {
        const ref = new URL(solanaPayUrl).searchParams.get("reference");
        if (ref) params.set("reference", ref);
      }

      if (!params.get("usd")) {
        params.set("usd", String(usd)); // usd is the component prop
      }

      const res = await axios.get(
        `/api/transaction/check?${params.toString()}`
      );
      console.log("Transaction check result:", res.data);
    } catch (err) {
      console.error("Transaction check failed:", err);
    }
  };
  const handleTestTransaction = async () => {
    if (!solanaPayUrl) return;

    try {
      setSending(true);

      const urlObj = new URL(solanaPayUrl);
      const amountStr = urlObj.searchParams.get("amount");
      const referenceStr = urlObj.searchParams.get("reference");
      const amount = amountStr ? Number(amountStr) : 0;
      const reference = referenceStr ?? undefined;

      const res = await axios.post("/api/transaction", {
        amountSol: amount,
        reference: reference,
      });

      dispatch(
        pushToast({
          messageToast: "Transaction sent successfully",
          headerToast: "success",
        })
      );

      console.log("Transaction result:", res.data);
    } catch (err) {
      console.error("Transaction error:", err);
      dispatch(
        pushToast({
          messageToast: "Failed to send transaction",
          headerToast: "error",
        })
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-2rem)]">
      <div className="card mx-auto max-w-xl shadow-lg bg-base-100">
        <div className="card-body space-y-6">
          <h2 className="text-2xl font-bold text-center">Pay with Crypto</h2>

          <div className="flex justify-center min-h-[220px] items-center">
            {loading && <span className="loading loading-spinner"></span>}
            {!loading && solanaPayUrl && (
              <QRCode value={solanaPayUrl} size={200} />
            )}
            {!loading && !solanaPayUrl && recipient && (
              <QRCode value={recipient} size={200} />
            )}
            {!loading && !recipient && <span>No QR code</span>}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">
              {solAmount ? `${solAmount} SOL` : "Loading..."}
            </span>
            <span className="text-sm">~${usd.toFixed(2)}</span>
          </div>

          <div className="text-center">
            <span className="text-base-content">
              Send only <span className="font-bold">Solana SOL</span> to this
              address,
              <br />
              or you risk losing your assets
            </span>
          </div>

          <div className="flex justify-center">
            <span className="badge badge-outline badge-lg font-bold px-3 gap-2">
              Solana <SiSolana />
            </span>
          </div>

          {session.data?.user.role === "admin" && (
            <div className="flex justify-center">
              <button
                className="btn btn-accent"
                onClick={handleTestTransaction}
                disabled={sending}
              >
                {sending ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Send transaction"
                )}
              </button>
            </div>
          )}
          <div className="flex justify-center">
            <button className="btn btn-accent" onClick={handleCheckTransaction}>
              Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
