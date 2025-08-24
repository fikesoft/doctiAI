"use client";
import React from "react";

export default function AdminActions({
  role,
  onSend,
  onCheck,
  sending,
}: {
  role?: string | null;
  onSend: () => Promise<void> | void;
  onCheck: () => Promise<void> | void;
  sending: boolean;
}) {
  if (role !== "admin") {
    return (
      <div className="flex justify-center">
        <button className="btn btn-accent" onClick={onCheck}>
          Check
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center">
        <button className="btn btn-accent" onClick={onSend} disabled={sending}>
          {sending ? (
            <span className="loading loading-spinner" />
          ) : (
            "Send transaction"
          )}
        </button>
      </div>
      <div className="flex justify-center mt-2">
        <button className="btn btn-accent" onClick={onCheck}>
          Check
        </button>
      </div>
    </>
  );
}
