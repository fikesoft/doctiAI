"use client";

import { useState } from "react";

import { type TiktokenModel } from "tiktoken";
import { useTokenCounter } from "@/app/(hooks)/useTokenCounter";

const models = [
  { label: "GPT‑4 & GPT‑4o Mini", value: "gpt-4" },
  { label: "GPT‑3.5 & GPT‑4", value: "gpt-3.5-turbo" },
];

export default function TokenExmaple() {
  const [text, setText] = useState("");
  const [model, setModel] = useState<TiktokenModel>("gpt-3.5-turbo");
  const tokens = useTokenCounter(text, model);
  const chars = text.length;

  return (
    <div className="card mx-auto max-w-xl shadow-lg bg-base-100">
      <div className="card-body space-y-6">
        {/* Intro paragraphs */}
        <p className="text-p">
          OpenAI’s large language models process text using{" "}
          <strong>tokens</strong>, which are common sequences of characters
          found in a set of text. The models learn the statistical relationships
          between these tokens and excel at predicting the next token in a
          sequence.
        </p>
        <p className="text-p-sm">
          Use this tool to see how your text maps to tokens, and to get an exact
          count for billing or prompt‑preparation purposes.
        </p>

        {/* Model selector tabs */}
        <div className="tabs tabs-boxed">
          {models.map(({ label, value }) => (
            <button
              key={value}
              className={`tab ${model === value ? "tab-active" : ""}`}
              onClick={() => setModel(value as TiktokenModel)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Text input */}
        <textarea
          className="textarea textarea-bordered w-full h-40"
          placeholder="Enter some text…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Counts */}
        <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
          <div className="stat">
            <div className="stat-title text-h4">Tokens</div>
            <div className="stat-value text-h3">{tokens}</div>
          </div>
          <div className="stat">
            <div className="stat-title text-h4">Characters</div>
            <div className="stat-value text-h3">{chars}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
