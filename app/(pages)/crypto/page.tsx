import React, { Suspense } from "react";
import CryptoClient from "./CryptoClient";

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
