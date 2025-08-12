import React, { Suspense } from "react";
import BillingTable from "./BillingTable";

const page = () => {
  return (
    <Suspense fallback="Loading your information">
      <BillingTable />
    </Suspense>
  );
};

export default page;
