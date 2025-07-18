"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
export function AuthModal({
  status,
}: {
  status: "authenticated" | "loading" | "unauthenticated";
}) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [status]);

  return (
    <dialog
      ref={modalRef}
      className="modal"
      onClose={() => {
        router.push("/");
      }}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">Access Restricted</h3>
        <p className="py-4">You must be signed in to view this section.</p>
        <div className="modal-action">
          <button
            className="btn"
            onClick={() => {
              modalRef.current?.close();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
