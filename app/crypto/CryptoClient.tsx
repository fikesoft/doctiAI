"use client";

import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { SiSolana } from "react-icons/si";
import axios, { AxiosError } from "axios";

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
  const [hoverAddress, setHoverAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (idempotencyKey) {
          // Fetch existing transaction details
          const res = await axios.get(`/api/deposit/${idempotencyKey}`);
          setRecipient(res.data.recipient);
          setSolAmount(res.data.sol);
          setSolanaPayUrl(res.data.solanaPayUrl);
        } else {
          // Create new deposit with idempotency key
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
        console.error(err.response?.data?.error ?? "Unknown error");
        setRecipient(null);
        setSolAmount(null);
        setSolanaPayUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usd, userId, idempotencyKey]);

  const handleCopy = (): void => {
    if (!recipient) return;
    navigator.clipboard.writeText(recipient);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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

          <div className="flex flex-col items-center gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                handleCopy();
                setHoverAddress(false);
              }}
              onMouseEnter={() => setHoverAddress(true)}
              onMouseLeave={() => setHoverAddress(false)}
              disabled={!recipient}
            >
              {copied ? "Copied!" : "Copy Address"}
            </button>
            {hoverAddress && recipient && (
              <span className="bg-base-300 p-1 text-sm rounded break-all max-w-xs">
                {recipient}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
