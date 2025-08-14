"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";

import Nav from "../Nav/Nav";
import BtnGitSignIn from "../BtnGitSignIn/BtnGitSignIn";
import ToggleTheme from "../ToggleTheme/ToggleTheme";
import HeaderSkeleton from "./HeaderSkeleton";

export default function Header() {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) if (!mounted) return <HeaderSkeleton />;
  const logoSrc =
    theme === "caramellatte" ? "/logo-caramelette.png" : "/logo-valentine.png";

  return (
    <header className="bg-base-100 shadow-md sticky top-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center h-16">
          {/* Left: logo */}
          <Link href="/">
            <Image src={logoSrc} alt="DocAI Logo" width={80} height={60} />
          </Link>

          {/* Center: nav (only on md+) */}
          <div className="hidden md:flex flex-1 justify-center">
            <Nav />
          </div>

          {/* Right: actions (only on md+) */}
          <div className="hidden md:flex items-center space-x-4 z-10">
            <ToggleTheme />
            <BtnGitSignIn />
          </div>

          {/* Mobile toggle (only below md) */}
          <button
            className="md:hidden ml-auto p-2 text-xl text-primary-focus z-10"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* mobile menu panel */}
        {menuOpen && (
          <nav className="md:hidden flex flex-col space-y-2 pb-4">
            <Nav />
            <div className="flex justify-center space-x-4 pt-2">
              <ToggleTheme />
              <BtnGitSignIn />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
