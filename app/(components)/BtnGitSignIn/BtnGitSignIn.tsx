"use client";
import React, { useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { FaChevronDown, FaGithub } from "react-icons/fa";
import Link from "next/link";

const BtnGitSignIn: React.FC = () => {
  const { data, status } = useSession(); // "loading" | "authenticated" | "unauthenticated"
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    const result = await signIn("github", {
      redirect: false, // stay on page to catch errors
      callbackUrl: "/chat",
      scope: "read:user repo",
    });

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.url) {
      // continue OAuth flow
      window.location.href = result.url;
    }
  };

  // While NextAuth is checking existing session
  if (status === "loading") {
    return <p>Checking authentication…</p>;
  }

  // If already signed in, you could render something else (or nothing)
  if (status === "authenticated") {
    return (
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost gap-2 normal-case">
          {data.user?.name}
          <FaChevronDown className="inline-block" />
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <Link href={"/account"} className="justify-start">
              My account
            </Link>
          </li>
          <li>
            <button
              onClick={() => signOut()}
              className="justify-start text-error"
            >
              Sign out
            </button>
          </li>
        </ul>
      </div>
    );
  }

  // Otherwise show your button
  return (
    <div>
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="btn btn-outline btn-neutral gap-2 flex items-center hover:btn-primary"
      >
        {isLoading ? (
          <>Loading…</>
        ) : (
          <>
            <FaGithub size={20} />
            Sign in with GitHub
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-error">Error signing in: {error}</p>
      )}
    </div>
  );
};

export default BtnGitSignIn;
