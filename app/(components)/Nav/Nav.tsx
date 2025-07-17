"use client";
import Link from "next/link";
import React from "react";

const Nav = () => {
  return (
    <nav className="flex justify-center gap-6">
      <Link href="/chat">Chat</Link>
      <Link href="/about">About us</Link>
      <Link href="/roadmap">Roadmap</Link>
    </nav>
  );
};

export default Nav;
