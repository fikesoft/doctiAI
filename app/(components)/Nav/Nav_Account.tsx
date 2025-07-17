"use client";
import Link from "next/link";
import React from "react";

const Nav_Account = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/account/information">Information</Link>
        </li>
        <li>
          <Link href="/account/billing-history">Billing History</Link>
        </li>
        <li>
          <Link href="/account/deposit">Deposit</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav_Account;
