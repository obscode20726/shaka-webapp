"use client";

import React from "react";

type Props = {
  email: string;
  loading?: boolean;
  error?: string;
  title?: string;
  onBack: () => void;
  onResend: () => Promise<void>;
  onVerify: (otp: string) => Promise<void>;
};

const RESEND_SECONDS = 60;

export default function SignupOtpVerification({
  email,
  loading = false,
  error = "",
  title = "Verify Your Email",
  onBack,
  onResend,
  onVerify,
}: Props) {
  const [digits, setDigits] = React.useState(Array(6).fill(""));
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (resendIn <= 0) return;

    const timer = window.setTimeout(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const otp = digits.join("");
  const canSubmit = otp.length === 6 && !loading;

  const setDigit = (index: number, value: string) => {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    setDigits(nextDigits);

    if (nextDigit && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    event.preventDefault();
    const nextDigits = Array(6).fill("");
    pasted.slice(0, 6).split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    setDigits(nextDigits);
    inputsRef.current[Math.min(pasted.length, 6) - 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (loading || resendIn > 0) return;

    await onResend();
    setDigits(Array(6).fill(""));
    setResendIn(RESEND_SECONDS);
    inputsRef.current[0]?.focus();
  };

  return (
    <section className="min-h-screen bg-[#f6f7f9] py-16 sm:py-[92px]">
      <div className="mx-auto w-full max-w-[520px] px-4">
        <div className="mb-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-3 text-sm font-medium text-black hover:text-black/70"
          >
            <span aria-hidden="true">&larr;</span>
            Back
          </button>
        </div>

        <div className="rounded-xl border border-[#d9d9df] bg-white px-6 py-7 text-center sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffedd4] text-[#ff5f00]">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </div>

          <h1 className="mt-7 text-2xl font-medium text-black">{title}</h1>
          <p className="mt-4 text-base leading-6 text-[#4A5565]">
            We&apos;ve sent a 6-digit code to
            <br />
            <strong className="font-semibold text-[#1f2937]">{email}</strong>
          </p>

          <div className="mt-7">
            <p className="text-sm font-medium text-[#1f2937]">
              Enter Verification Code
            </p>
            <div className="mt-3 grid grid-cols-6 gap-2 sm:gap-2.5">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(input) => {
                    inputsRef.current[index] = input;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => setDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  className="aspect-square w-full rounded-xl border border-[#cfd5df] bg-white text-center text-xl font-semibold text-black outline-none focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/25"
                  aria-label={`Verification digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onVerify(otp)}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#ffaf75] text-sm font-medium text-white hover:bg-[#ff8d3d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-7 text-sm text-[#4A5565]">
            <p>Didn&apos;t receive the code?</p>
            {resendIn > 0 ? (
              <p className="mt-2">Resend code in {resendIn}s</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="mt-2 font-medium text-[#ff5f00] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend Code
              </button>
            )}
          </div>

          <p className="mt-7 rounded-lg border border-[#b7d4ff] bg-[#edf5ff] px-4 py-3 text-left text-sm text-[#1640c8]">
            Check your email inbox for the Shaka verification code.
          </p>
        </div>

      </div>
    </section>
  );
}
