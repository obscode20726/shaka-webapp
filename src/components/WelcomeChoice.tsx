import Link from "next/link";
import React from "react";

export default function WelcomeChoice() {
  return (
    <section className="bg-[#f6f7f9] py-10 sm:py-16">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-black/60 hover:text-black"
          >
            <span className="mr-1 text-lg">←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-[26px] sm:text-[30px] font-semibold text-black">
            Welcome to Shaka
          </h1>
          <p className="mt-1 text-sm text-black/60">
            Choose how you&apos;d like to get started
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Homeowner card */}
          <article className="flex flex-col rounded-2xl border border-black/[.06] bg-white p-6 sm:p-8 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <div>
              <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-[#e8f1ff] text-xl text-[#1a73e8]">
                {/* Home icon */}
                <span>🏠</span>
              </div>
              <h2 className="text-lg font-semibold text-black text-center">
                I&apos;m a Homeowner
              </h2>
              <p className="mt-1 text-sm text-black/60 text-center">
                Looking for reliable service providers
              </p>

              <ul className="mt-4 space-y-2 text-sm text-black/70">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
                  <span>Book trusted professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
                  <span>Track your service requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
                  <span>Rate and review services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
                  <span>Manage payments securely</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 space-y-2">
              <Link
                href="/signup/homeowner"
                className="inline-flex w-full items-center justify-center rounded-md bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1557b5]"
              >
                <span>Sign Up as Homeowner</span>
                <span className="ml-2 text-base">→</span>
              </Link>
              <Link
                href="/signin/homeowner"
                className="inline-flex w-full items-center justify-center rounded-md border border-black/[.08] bg-white px-4 py-2 text-sm font-medium text-black/80 hover:bg-black/[.02]"
              >
                Sign In
              </Link>
            </div>
          </article>

          {/* Service provider card */}
          <article className="flex flex-col rounded-2xl border border-black/[.06] bg-white p-6 sm:p-8 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <div>
              <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-[#fff3e6] text-xl text-[#ff6a00]">
                {/* Wrench icon */}
                <span>🛠️</span>
              </div>
              <h2 className="text-lg font-semibold text-black text-center">
                I&apos;m a Service Provider
              </h2>
              <p className="mt-1 text-sm text-black/60 text-center">
                Ready to grow my business
              </p>

              <ul className="mt-4 space-y-2 text-sm text-black/70">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff6a00]" />
                  <span>Find new customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff6a00]" />
                  <span>Manage bookings efficiently</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff6a00]" />
                  <span>Get paid quickly and securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff6a00]" />
                  <span>Build your reputation</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 space-y-2">
              <Link
                href="/signup/provider"
                className="inline-flex w-full items-center justify-center rounded-md bg-[#ff6a00] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#e05d00]"
              >
                <span>Sign Up as Provider</span>
                <span className="ml-2 text-base">→</span>
              </Link>
              <Link
                href="/signin/provider"
                className="inline-flex w-full items-center justify-center rounded-md border border-black/[.08] bg-white px-4 py-2 text-sm font-medium text-black/80 hover:bg-black/[.02]"
              >
                Sign In
              </Link>
            </div>
          </article>
        </div>

        <div className="mt-10 mx-auto max-w-3xl rounded-2xl border border-black/[.06] bg-white p-6 sm:p-8 text-sm text-black/70 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <h3 className="text-center text-sm font-medium text-black">
            Not sure which option is right for you?
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-black/60">
                Choose Homeowner if you:
              </p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  Need electrical, plumbing, cleaning, or gardening services
                </li>
                <li>Want to hire professionals for your home</li>
                <li>Are looking to book and pay for services</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-black/60">
                Choose Service Provider if you:
              </p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  Offer electrical, plumbing, cleaning, or gardening services
                </li>
                <li>Want to find new customers and grow your business</li>
                <li>Are a licensed professional or skilled tradesperson</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
