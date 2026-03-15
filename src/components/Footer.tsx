import Link from "next/link";
import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0f1419] text-white">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
          <Link href="#" className="text-xl font-semibold tracking-tight">
            <Image
              src="/shakaLogo2.svg"
              alt="Shaka"
              width={133}
              height={37}
              className="h-9 w-auto"
              priority
            />
            </Link>
            <p className="mt-3 text-sm text-white/70 max-w-sm">
              Connecting homeowners with trusted service providers for all your
              home maintenance and improvement needs.
            </p>
            <div className="mt-4 flex items-center gap-4 text-white/70">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-semibold mb-3">Services</h4>
              <ul className="space-y-2 text-white/70">
                <li>Electrical</li>
                <li>Plumbing</li>
                <li>Gardening</li>
                <li>Cleaning</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li>About Us</li>
                <li>How It Works</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li>Help Center</li>
                <li>Contact</li>
                <li>FAQs</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/60 flex items-center justify-between">
          <p>© 2025 Shaka. All rights reserved.</p>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="#" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
