"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineUser,
  HiOutlineReceiptTax,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

// Nav items config
const navItems = [
  {
    href: "/account/information",
    icon: HiOutlineUser,
    label: "Information",
  },
  {
    href: "/account/billing-history",
    icon: HiOutlineReceiptTax,
    label: "Billing",
  },
  {
    href: "/account/deposit",
    icon: HiOutlineCurrencyDollar,
    label: "Deposit",
  },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <div
      className="
        dock dock-md bg-base-200
        fixed z-50
        md:top-1/2 md:-translate-y-1/2
        md:left-0 md:w-28
        md:rounded-2xl
        md:ml-4
        bottom-0 left-0
        w-full h-fit
        flex md:flex-col flex-row
        items-center justify-center
        gap-6 md:gap-y-6
      "
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center group px-2 py-1 w-full"
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="dock-label">{label}</span>
            {/* HIGHLIGHT BAR */}
            {isActive && (
              <>
                {/* Mobile: bottom bar */}
                <span
                  className="
                    absolute left-1/2 -translate-x-1/2 bottom-0
                    block md:hidden
                    w-8 h-1 rounded-full bg-primary transition-all
                  "
                />
                {/* Desktop: right vertical bar */}
                <span
                  className="
                    hidden md:block
                    absolute right-0 top-1/2 -translate-y-1/2
                    w-1 h-10 rounded-full bg-primary transition-all
                  "
                />
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
