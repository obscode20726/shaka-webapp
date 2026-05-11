"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const navLinks = [
  { href: "#", label: "Search" },
  { href: "#", label: "Service Areas" },
  { href: "#", label: "Services" },
  { href: "#", label: "How it works" },
  { href: "#", label: "About" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-black/[.06]">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 select-none"
            onClick={closeMenu}
          >
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
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/signin/homeowner"
              className="hidden sm:inline-flex h-9 px-4 items-center rounded-md text-sm font-medium text-black hover:bg-black/[.04]"
            >
              Sign In
            </Link>
            <button
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-black text-white hover:bg-black/90 md:hidden"
            >
              <span className="relative h-4 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform ${
                    isMenuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-transform ${
                    isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
            <Link
              href="/get-started"
              className="hidden md:inline-flex h-9 px-4 items-center rounded-md text-sm font-medium text-white bg-black hover:bg-black/90"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`overflow-hidden transition-[max-height,opacity] duration-200 md:hidden ${
            isMenuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="border-t border-black/[.06] py-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-black/75 hover:bg-black/[.04] hover:text-black"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-black/[.06] pt-3 md:hidden">
              <Link
                href="/signin/homeowner"
                onClick={closeMenu}
                className="inline-flex h-10 items-center justify-center rounded-md text-sm font-medium text-black hover:bg-black/[.04] sm:hidden"
              >
                Sign In
              </Link>
              <Link
                href="/get-started"
                onClick={closeMenu}
                className="inline-flex h-10 items-center justify-center rounded-md bg-black text-sm font-medium text-white hover:bg-black/90"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
