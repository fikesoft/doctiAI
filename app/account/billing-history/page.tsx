import React from "react";
import CustomSuspense from "@/app/(components)/CustomSuspense/CustomSuspense";
import BillingTable from "./BillingTable";
import { getUserTransactions } from "@/lib/transaction/getUserTransactions";

export default async function Page() {
  const transactions = await getUserTransactions();

  return (
    <CustomSuspense
      loadingText="Loading table..."
      spinnerStyle="dots"
      size="xl"
      colorClass="text-primary"
    >
      <BillingTable transactions={transactions} />
    </CustomSuspense>
  );
}
