"use client";

import React, { ReactNode } from "react";
import Nav_Account from "../(components)/Nav/Nav_Account";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <section>
      <div className="flex gap-6">
        <Nav_Account />
        {children}
      </div>
    </section>
  );
};

export default layout;
