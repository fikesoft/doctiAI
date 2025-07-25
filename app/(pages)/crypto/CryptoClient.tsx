"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import QRCode from "react-qr-code";
import { SiSolana } from "react-icons/si";

export default function CryptoClient(): React.ReactNode {
  const searchParams = useSearchParams();
  const usd = searchParams.get("usd");

  const [recipient, setRecipient] = useState<string | null>(null);
  const [solAmount, setSolAmount] = useState<string | null>(null);
  const [hoverAddress, setHoverAddress] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!usd) return;
    setLoading(true);
    axios
      .get<{ recipient: string; sol?: string }>("/api/deposit", {
        params: { usd },
      })
      .then((res) => {
        setRecipient(res.data.recipient);
        setSolAmount(res.data.sol ?? null);
      })
      .catch(() => {
        setRecipient(null);
        setSolAmount(null);
      })
      .finally(() => setLoading(false));
  }, [usd]);

  const handleCopy = (): void => {
    if (!recipient) return;
    navigator.clipboard.writeText(recipient);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card mx-auto max-w-xl shadow-lg bg-base-100">
      <div className="card-body space-y-6">
        <h2 className="text-2xl font-bold text-center">Pay with Crypto</h2>

        <div className="flex justify-center min-h-[220px] items-center">
          {loading && <span>Loading QR Code...</span>}
          {!loading && recipient && <QRCode value={recipient} size={200} />}
          {!loading && !recipient && <span>No QR code</span>}
        </div>

        <div className="flex flex-col items-center">
          <span className="text-h6 font-bold ">
            {solAmount ? `${solAmount} SOL` : "sol amount"}
          </span>
          <span className="text-p-sm">~${usd}</span>
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
          {hoverAddress && (
            <span className="bg-primary-content p-1 text-p-sm">
              {recipient}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
