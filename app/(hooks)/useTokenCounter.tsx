import { encoding_for_model, type TiktokenModel } from "@dqbd/tiktoken";
import { useEffect, useState } from "react";

export function useTokenCount(
  text: string,
  model: TiktokenModel = "gpt-3.5-turbo"
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try {
      const enc = encoding_for_model(model);
      setCount(enc.encode(text).length);
    } catch (err) {
      console.error("Token encoder error:", err);
      setCount(0);
    }
  }, [text, model]);

  return count;
}
