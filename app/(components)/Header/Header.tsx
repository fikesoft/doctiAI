"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "../Nav/Nav";
import BtnGitSignIn from "../BtnGitSignIn/BtnGitSignIn";
import ToggleTheme from "../ToggleTheme/ToggleTheme";

export default function Header() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until after mounting to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  //Logo based on the theme
  const logoSrc =
    theme === "caramellatte" ? "/logo-caramelette.png" : "/logo-valentine.png";

  if (!mounted) return null;

  return (
    <header className="bg-base-100 shadow-md">
      {/* constrained container */}
      <div className="container mx-auto px-4">
        <div className="navbar justify-between">
          {/*Logo */}
          <Link href="/">
            <Image src={logoSrc} alt="DocAI Logo" width={80} height={60} />
          </Link>
          {/*Navbar */}
          <Nav />
          {/*Theme changing */}
          <div className="flex gap-3">
            {/*Toggle theme */}
            <ToggleTheme />
            {/*Sign in with github */}
            <BtnGitSignIn />
          </div>
        </div>
      </div>
    </header>
  );
}
