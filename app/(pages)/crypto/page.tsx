import React, { Suspense } from "react";
import CryptoClient from "./CryptoClient";

// Ensure Next.js never prerenders this at build time
export const dynamic = "force-dynamic";

export default function Page(): React.ReactNode {
  return (
    <section>
      <Suspense fallback={<div>Loading payment widget…</div>}>
        <CryptoClient />
      </Suspense>
    </section>
  );
}
