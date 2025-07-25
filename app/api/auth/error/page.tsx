import React, { Suspense } from "react";
import AuthErrorClient from "./AuthErrorClient";

// Don’t pre-render at build time—this page is client‑driven
export const dynamic = "force-dynamic";

export default function Page(): React.ReactNode {
  return (
    <Suspense fallback={<div>Loading error page…</div>}>
      <AuthErrorClient />
    </Suspense>
  );
}
