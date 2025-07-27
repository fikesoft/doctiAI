"use client";

import React, { ReactNode } from "react";
import { RequireAuth } from "../(components)/RequireAuth/RequireAuth";
import { AccountNav } from "../(components)/Nav/Nav_Account";

const LayoutAccount = ({ children }: { children: ReactNode }) => {
  return (
    <RequireAuth>
      <section>
        <AccountNav />
        <div className="p-4 md:pl-20 pb-20 md:pb-0 ">{children}</div>{" "}
      </section>
    </RequireAuth>
  );
};

export default LayoutAccount;
