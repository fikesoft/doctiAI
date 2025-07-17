"use client";

import React, { useState } from "react";

export interface CodeToggleProps {
  before: string;
  after: string;
  paneHeightClass?: string;
}

export const CodeToggle: React.FC<CodeToggleProps> = ({
  before,
  after,
  paneHeightClass = "h-147",
}) => {
  const [view, setView] = useState<"before" | "after">("before");
  const lines = (view === "before" ? before : after).split("\n");

  return (
    <div>
      {/* Button group */}
      <div className="btn-group flex gap-6 justify-end mb-4">
        <button
          onClick={() => setView("before")}
          className={`btn ${view === "before" ? "btn-primary" : "btn-outline"}`}
        >
          Before
        </button>
        <button
          onClick={() => setView("after")}
          className={`btn ${view === "after" ? "btn-primary" : "btn-outline"}`}
        >
          After
        </button>
      </div>

      {/* Code panel */}
      <div
        className={`mockup-code bg-base-100 text-primary rounded-lg p-4 overflow-auto ${paneHeightClass}`}
      >
        {lines.map((line, i) => (
          <pre key={i} data-prefix={i + 1}>
            <code className="whitespace-pre">{line}</code>
          </pre>
        ))}
      </div>
    </div>
  );
};

export default CodeToggle;
