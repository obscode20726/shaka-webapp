"use client";

import React from "react";
import Link from "next/link";

type BookServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function BookServiceModal({
  isOpen,
  onClose,
}: BookServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-black/40 hover:text-black"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black sm:text-3xl">
            How would you like to get service?
          </h2>
          <p className="mt-2 text-sm text-black/60">
            Choose the option that works best for you
          </p>
        </div>

        {/* Options Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Option 1: Book a Specific Provider */}
          <div className="rounded-2xl border border-black/10 p-6 hover:border-black/20 transition-all">
            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <span className="text-2xl">👤</span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-black">
              Book a Specific Provider
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-black/60">
              Browse and choose from available providers
            </p>

            {/* Checklist */}
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2 text-sm text-black/70">
                <span className="text-orange-500 font-bold">✓</span>
                <span>See provider profiles, ratings & reviews</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-black/70">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Compare prices and availability</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-black/70">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Book directly with your choice</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-black/70">
                <span className="text-orange-500 font-bold">✓</span>
                <span>Best when you know who you want</span>
              </li>
            </ul>

            {/* Button */}
            <Link
              href="/browse-providers"
              onClick={onClose}
              className="mt-6 block w-full rounded-lg bg-orange-500 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Browse Providers
            </Link>
          </div>

          {/* Option 2: Post a Service Request */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 hover:border-blue-300 transition-all">
            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <span className="text-2xl">📢</span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-black">
              Post a Service Request
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-black/60">
              Let providers come to you with offers
            </p>

            {/* Checklist */}
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2 text-sm text-black/70">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Describe your job & upload photos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-black/70">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Multiple providers see your request</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-black/70">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Receive competitive quotes</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-black/70">
                <span className="text-blue-500 font-bold">✓</span>
                <span>Best for complex or urgent jobs</span>
              </li>
            </ul>

            {/* Button */}
            <Link
              href="/post-service-request"
              onClick={onClose}
              className="mt-6 block w-full rounded-lg bg-blue-500 py-3 text-center text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              Post Request
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
