import React from "react";

export default function AmountDisplay({
  solAmount,
  usd,
}: {
  solAmount?: string | null;
  usd: number;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold">
        {solAmount ? `${solAmount} SOL` : "Loading..."}
      </span>
      <span className="text-sm">~${usd.toFixed(2)}</span>
    </div>
  );
}
