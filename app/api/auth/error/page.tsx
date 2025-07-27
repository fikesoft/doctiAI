import React, { Suspense } from "react";
import AuthErrorClient from "./AuthErrorClient";

export const dynamic = "force-dynamic";

export default function Page(): React.ReactNode {
  return (
    <Suspense fallback={<div>Loading error page…</div>}>
      <AuthErrorClient />
    </Suspense>
  );
}
