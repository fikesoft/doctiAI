"use client";

import { useTokenConverter } from "@/app/(hooks)/useTokenConverter";
import useAppDispatch from "@/store/hooks/useDispatch";
import { pushToast } from "@/store/slices/toast";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
export function SolanaDeposit() {
  const { rawUsd, tokens, onChange } = useTokenConverter("usd");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleSubmitDeposit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const rawUsdFloat = parseFloat(rawUsd);
    if (!rawUsd || isNaN(rawUsdFloat) || rawUsdFloat <= 0) {
      dispatch(
        pushToast({
          messageToast: "Please insert an amount greater than 0",
          headerToast: "error",
        })
      );
      return;
    }
    router.push(`/crypto?usd=${rawUsdFloat}`);
  };
  return (
    <form onSubmit={(e) => handleSubmitDeposit(e)}>
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
            name="usd"
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

          {/* Deposit button */}
          <button type="submit" className="btn btn-primary w-full">
            Deposit with Solana
          </button>
        </div>
      </div>
    </form>
  );
}
