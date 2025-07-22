"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import store from "../../store/store";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="caramellatte"
      enableSystem={false}
    >
      <Provider store={store}>
        <SessionProvider>{children}</SessionProvider>
      </Provider>
    </ThemeProvider>
  );
}
