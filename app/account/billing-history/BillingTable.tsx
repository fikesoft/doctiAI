"use client";

import { useState } from "react";
import CryptoClient from "@/app/crypto/CryptoClient";
import { TbFaceIdError } from "react-icons/tb";
import { TransactionSerialized } from "@/types/api";
import { useSession } from "next-auth/react";
type SelectedTx = {
  idempotencyKey: string;
  usd: string;
};
export default function BillingTableClient({
  transactions,
}: {
  transactions: TransactionSerialized[];
}) {
  const [selectedTx, setSelectedTx] = useState<SelectedTx | null>(null);
  const { data } = useSession();
  return (
    <div className="p-2">
      <div className="card bg-base-100 shadow-lg p-2 sm:p-4 overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="table w-full min-w-[600px]">
          <thead>
            <tr>
              <th>Deposit ID</th>
              <th>Date</th>
              <th>State</th>
              <th>SOL Amount</th>
              <th>Fiat Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center text-center py-10 text-error">
                    <TbFaceIdError size={64} />
                    <h1 className="text-h1">
                      Firstly make a transaction to see your billing history
                    </h1>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map(
                ({
                  id,
                  createdAt,
                  status,
                  cryptoAmount,
                  fiatAmount,
                  idempotencyKey,
                }) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{new Date(createdAt).toLocaleString()}</td>
                    <td
                      className={
                        status === "pending"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }
                    >
                      {status}
                    </td>
                    <td>{parseFloat(cryptoAmount).toFixed(6)}</td>
                    <td>${fiatAmount}</td>
                    <td>
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => {
                          if (status === "pending") {
                            setSelectedTx({
                              idempotencyKey: idempotencyKey,
                              usd: fiatAmount,
                            });
                          }
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Fullscreen modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 btn btn-sm btn-circle z-50"
              onClick={() => setSelectedTx(null)}
            >
              ✕
            </button>
            {data?.user.id ? (
              <CryptoClient
                usd={parseInt(selectedTx.usd)}
                userId={data?.user.id} // replace with session user id
                idempotencyKey={selectedTx.idempotencyKey}
              />
            ) : (
              <h1 className="text-h1 text-primary">
                Missing your user id please try to login firsly
              </h1>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
