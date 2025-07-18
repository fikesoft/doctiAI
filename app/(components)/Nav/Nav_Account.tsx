// components/SidebarMenu.tsx
"use client";

import Link from "next/link";
import {
  HiOutlineUser,
  HiOutlineReceiptTax,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

export function AccountNav() {
  return (
    <nav className="group">
      <ul
        className="
          menu menu-vertical bg-base-200 rounded-box
          w-16                     /* collapsed width */
          group-hover:w-48         /* expands on hover */
          transition-all duration-300 overflow-hidden
        "
      >
        <li>
          <Link
            href="/account/information"
            className="flex items-center gap-2 p-2"
          >
            <HiOutlineUser className="h-6 w-6" />
            <span
              className="
                whitespace-nowrap
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              "
            >
              Information
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/account/billing-history"
            className="flex items-center gap-2 p-2"
          >
            <HiOutlineReceiptTax className="h-6 w-6" />
            <span
              className="
                whitespace-nowrap
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              "
            >
              Billing History
            </span>
          </Link>
        </li>
        <li>
          <Link href="/account/deposit" className="flex items-center gap-2 p-2">
            <HiOutlineCurrencyDollar className="h-6 w-6" />
            <span
              className="
                whitespace-nowrap
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
              "
            >
              Deposit
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
