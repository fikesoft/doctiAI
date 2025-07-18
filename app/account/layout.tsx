"use client";

import React, { ReactNode } from "react";
import { RequireAuth } from "../(components)/RequireAuth/RequireAuth";
import { AccountNav } from "../(components)/Nav/Nav_Account";

const LayoutAccount = ({ children }: { children: ReactNode }) => {
  return (
    <RequireAuth>
      <section>
        <div className="flex gap-6 items-center">
          <AccountNav />
          {children}
        </div>
      </section>
    </RequireAuth>
  );
};

export default LayoutAccount;
