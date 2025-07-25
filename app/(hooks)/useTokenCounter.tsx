import { useEffect, useState } from "react";
import axios from "axios";
import { type TiktokenModel } from "tiktoken";

export function useTokenCounter(
  text: string,
  model: TiktokenModel = "gpt-3.5-turbo"
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!text) {
      setCount(0);
      return;
    }
    let canceled = false;
    axios
      .post("/api/tokens", { text, model })
      .then((res) => {
        if (!canceled) setCount(res.data.tokens || 0);
      })
      .catch(() => {
        if (!canceled) setCount(0);
      });
    return () => {
      canceled = true;
    };
  }, [text, model]);

  return count;
}
