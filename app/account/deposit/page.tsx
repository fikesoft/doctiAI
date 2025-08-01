"use client";
import TokenExample from "@/app/(components)/TokenExample/TokenExample";
import { useSession } from "next-auth/react";
import { SolanaDeposit } from "@/app/(components)/SolonaDeposit/SolanaDeposit";
import React from "react";

const Deposit = () => {
  const { data } = useSession();
  const balance = data?.user.balance;
  return (
    <div>
      <div className="flex justify-end items-center gap-3">
        <p className="text-p">Balance:</p>
        <p className="text-p-sm">{balance} tokens</p>
      </div>
      <div className="flex lg:flex-row flex-col   justify-center items-start gap-8">
        <TokenExample />
        <div className="flex items-end">
          <SolanaDeposit />
        </div>
      </div>
    </div>
  );
};

export default Deposit;
