"use client";
import { AuthModal } from "@/app/(modals)/AuthModal";
import { useSession } from "next-auth/react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  if (status === "unauthenticated") return <AuthModal status={status} />;
  if (status === "loading") return <p>Loading…</p>;
  return <>{children}</>;
}
