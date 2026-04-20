"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-black/[.06]">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 select-none">
            <Image
              src="/Shaka logo 1.svg"
              alt="Shaka"
              width={133}
              height={37}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-black/80">
            <Link href="#" className="hover:text-black transition-colors">
              Search
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Service Areas
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Services
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              How it works
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex h-9 px-4 items-center rounded-md text-sm font-medium text-black hover:bg-black/[.04]">
              Sign In
            </button>
            <button className="inline-flex h-9 px-4 items-center rounded-md text-sm font-medium text-white bg-black hover:bg-black/90 md:hidden">
              Menu
            </button>
            <Link
              href="/get-started"
              className="hidden md:inline-flex h-9 px-4 items-center rounded-md text-sm font-medium text-white bg-black hover:bg-black/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
