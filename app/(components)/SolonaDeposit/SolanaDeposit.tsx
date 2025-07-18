"use client";

import { useTokenConverter } from "@/app/(hooks)/useTokenConverter";

export function SolanaDeposit() {
  const { rawUsd, tokens, onChange } = useTokenConverter("usd");

  return (
    <div className="card mx-auto max-w-xl shadow-lg bg-base-100 h-auto ">
      <div className="card-body space-y-6">
        {/* USD input */}
        <div className="flex flex-col">
          <label htmlFor="usd" className="block text-h4">
            Deposit amount (USD)
          </label>
          <p className="text-p-sm">The amount will be converted in Solana</p>
        </div>
        <input
          id="usd"
          type="number"
          min="0"
          step="0.01"
          value={rawUsd}
          onChange={onChange}
          placeholder="e.g. 25.00"
          className="input input-bordered w-full"
        />

        {/* Token estimate */}
        <p className="text-p-sm inline-block">
          ≈ <strong>{tokens.toLocaleString()}</strong> tokens
        </p>

        {/* Deposit button (you wire up logic) */}
        <button
          className="btn btn-primary w-full"
          onClick={() => {
            /* your Solana deposit flow here */
          }}
        >
          Deposit with Solana
        </button>
      </div>
    </div>
  );
}
