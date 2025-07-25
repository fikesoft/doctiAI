"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  AccessDenied: "You need to allow access to continue.",
  OAuthSignin: "Error signing in.",
  OAuthCallback: "Error during callback.",
  OAuthAccountNotLinked: "This account is already linked with another user.",
};

export default function AuthErrorClient(): React.ReactNode {
  const errorCode = useSearchParams().get("error") ?? "UnknownError";
  const message =
    errorMessages[errorCode] ||
    "There was a problem while processing your sign in.";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Oops…</h1>
        <p className="mb-6">{message}</p>
        <Link href="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
