"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { TransactionSerialized } from "@/types/api";

const BillingTable = () => {
  const [transactions, setTransactions] = useState<TransactionSerialized[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{
          transactions: TransactionSerialized[];
        }>("/api/crypto-transaction");
        setTransactions(response.data.transactions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load transactions");
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <p className="p-4">Loading transactions...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-2">
      <div className="card bg-base-100 shadow-lg p-2 sm:p-4 overflow-x-auto">
        <table className="table w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="whitespace-nowrap">Deposit ID</th>
              <th className="whitespace-nowrap">Date</th>
              <th className="whitespace-nowrap">State</th>
              <th className="whitespace-nowrap">SOL Amount</th>
              <th className="whitespace-nowrap">Fiat Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(
              ({ id, createdAt, status, cryptoAmount, fiatAmount }) => (
                <tr key={id} className="text-p sm:text-p-sm">
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
                  <td>{cryptoAmount.slice(-6)}</td>
                  <td>${fiatAmount.toString()}</td>
                  <td>
                    <button className="btn btn-xs btn-outline">Details</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingTable;
