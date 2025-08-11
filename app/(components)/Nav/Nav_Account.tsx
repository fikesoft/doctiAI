"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineUser,
  HiOutlineReceiptTax,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  const items: {
    label: string;
    path: string;
    Icon: React.ComponentType<{ size?: number }>;
  }[] = [
    { label: "Information", path: "/account/information", Icon: HiOutlineUser },
    {
      label: "Billing",
      path: "/account/billing-history",
      Icon: HiOutlineReceiptTax,
    },
    {
      label: "Deposit",
      path: "/account/deposit",
      Icon: HiOutlineCurrencyDollar,
    },
  ];

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
        w-full
        flex md:flex-col flex-row
        items-center justify-center
        gap-6 md:gap-y-6
        lg:h-fit
        h-14
      "
    >
      {items.map(({ label, path, Icon }) => {
        const isActive = pathname === path;
        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            className="relative flex flex-col items-center group px-2 py-1"
          >
            <Icon size={24} />
            <span className="dock-label">{label}</span>

            {isActive && (
              <>
                {/* Mobile: bottom bar */}
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 block md:hidden w-8 h-1 rounded-full bg-primary transition-all" />
                {/* Desktop: right vertical bar */}
                <span className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full bg-primary transition-all" />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
