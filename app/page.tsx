"use client";

import { CodeToggle } from "./(components)/CodeDiff/CodeDiff";
import PricingCard from "./(components)/PricingCard/PricingCard";
import { RAW_CODE, DOC_CODE } from "./(data)/codeExample";
export default function Home() {
  return (
    <section>
      {/*Hero section */}
      <div className="flex xl:flex-row flex-col justify-between gap-6">
        <div className="xl:max-w-2/6  xl:text-start text-center ">
          <h1 className="text-h1">AI Documentaion(Fast, Easy & Free start)</h1>
          <p className="text-p ">
            Land your next role with DocAI, the AI-powered documentation
            assistant that turns your GitHub repos into polished,
            developer-ready docs in seconds. Access DocAI from your computer or
            phone, choose from a library of industry-approved doc templates, and
            insert context-aware code explanations and examples with a single
            click.
          </p>
          {/*Card container */}
          <PricingCard />
        </div>
        {/*Code difference */}
        <div>
          <CodeToggle before={RAW_CODE} after={DOC_CODE} />
        </div>
      </div>
    </section>
  );
}
