"use client";

import { useState, useMemo, ChangeEvent } from "react";

const BASE_INPUT_COST_PER_MILLION = 0.5; // $ per 1 M input tokens
const BASE_OUTPUT_COST_PER_MILLION = 1.5; // $ per 1 M output tokens
const BASE_COST_PER_THOUSAND =
  (BASE_INPUT_COST_PER_MILLION + BASE_OUTPUT_COST_PER_MILLION) / 1000; // $ per 1 000 tokens
const MARKUP_FACTOR = 2; // 100% above base

type Mode = "tokens" | "usd";

export function useTokenConverter(initialMode: Mode = "tokens") {
  const [mode] = useState<Mode>(initialMode);
  const [raw, setRaw] = useState("");

  // parse the raw input into a number
  const value = useMemo(() => {
    const n = parseFloat(raw);
    return isNaN(n) ? 0 : n;
  }, [raw]);

  // compute token count
  const tokens = useMemo(() => {
    if (mode === "usd") {
      // USD → tokens
      return Math.floor(
        (value * 1000) / (BASE_COST_PER_THOUSAND * MARKUP_FACTOR)
      );
    } else {
      // tokens mode → integer part
      return Math.floor(value);
    }
  }, [mode, value]);

  // compute USD cost
  const cost = useMemo(() => {
    if (mode === "tokens") {
      // tokens → USD
      return (tokens / 1000) * BASE_COST_PER_THOUSAND * MARKUP_FACTOR;
    } else {
      // usd mode → raw value is the cost
      return value;
    }
  }, [mode, tokens, value]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value);
  };

  return {
    // always available
    rawUsd: mode === "usd" ? raw : "",
    rawTokens: mode === "tokens" ? raw : "",
    tokens, // computed integer token count
    cost, // computed USD cost
    onChange,
  };
}
