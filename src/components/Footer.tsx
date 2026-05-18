import Image from "next/image";
import Link from "next/link";
import React from "react";

const socialLinks = [
  { href: "#", icon: "/icons/socials/facebook.svg", label: "Facebook" },
  { href: "#", icon: "/icons/socials/instagram.svg", label: "Instagram" },
  { href: "#", icon: "/icons/socials/linkedin.svg", label: "LinkedIn" },
  { href: "#", icon: "/icons/socials/x.svg", label: "X" },
];

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="mx-auto max-w-[1232px] px-6 py-10 sm:px-8 lg:px-0">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_410px] md:items-start">
          <div className="max-w-[500px]">
            <Link href="#" className="text-xl font-semibold tracking-tight">
              <Image
                src="/shakaLogo2.svg"
                alt="Shaka"
                width={133}
                height={37}
                className="h-[37px] w-auto"
                priority
              />
            </Link>
            <p className="mt-3 max-w-[500px] text-base leading-6 text-[#99A1AF]">
              Connecting homeowners with trusted service providers for all your
              home maintenance and improvement needs.
            </p>
            <div className="mt-5 flex items-center gap-5">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-5 w-5 items-center justify-center opacity-100 transition hover:opacity-75"
                >
                  <Image
                    src={social.icon}
                    alt=""
                    width={21}
                    height={21}
                    className="max-h-5 w-auto"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 text-base md:gap-[94px]">
            <div>
              <h4 className="mb-5 text-lg font-normal text-white">Services</h4>
              <ul className="space-y-4 text-[#99A1AF]">
                <li>Electrical</li>
                <li>Plumbing</li>
                <li>Gardening</li>
                <li>Cleaning</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-5 text-lg font-normal text-white">Company</h4>
              <ul className="space-y-4 text-[#99A1AF]">
                <li>About Us</li>
                <li>How It Works</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#364153] pt-6 text-center text-base text-[#99A1AF]">
          <p>&copy; 2025 Shaka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
