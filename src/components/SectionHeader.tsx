import React from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = true,
}: Props) {
  return (
    <div className={centered ? "text-center" : "text-left"}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-wide text-[#ff6a00]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-[22px] sm:text-[26px] font-semibold text-black">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-sm text-black/60 mt-1">{subtitle}</p>
      ) : null}
    </div>
  );
}
