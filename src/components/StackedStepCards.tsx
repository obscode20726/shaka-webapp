"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  cardVariants,
  cardHoverVariants,
  invertedReveal,
  stickyStacking,
} from "@/lib/animations/variants";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
};

export type Step = {
  title: string;
  desc: string;
  iconSrc: string;
};

type StackedStepCardsProps = {
  steps: Step[];
};

function DesktopStepCard({
  step,
  index,
}: {
  step: Step;
  index: number;
}) {
  const combinedVariants = {
    ...stickyStacking,
    ...cardHoverVariants,
  };

  return (
    <motion.article
      variants={combinedVariants}
      className="rounded-xl border border-black/[.08] bg-white p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      whileHover="hover"
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-100px", once: true }}
    >
      <motion.div
        variants={invertedReveal}
        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff5ee]"
      >
        <Image
          src={step.iconSrc}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
          aria-hidden="true"
        />
      </motion.div>
      <p className="text-xs uppercase tracking-wide text-[#ff6a00]">
        Step {index + 1}
      </p>
      <h3 className="mt-1 font-semibold text-black">{step.title}</h3>
      <p className="mt-1 text-sm text-black/60">{step.desc}</p>
    </motion.article>
  );
}

function StepCard({
  step,
  index,
  total,
  scrollYProgress,
}: {
  step: Step;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const segmentStart = index / total;
  const segmentEnd = Math.min((index + 1.4) / total, 1);
  const scale = useTransform(
    scrollYProgress,
    [segmentStart, segmentEnd],
    [1, Math.max(0.88, 0.94 - index * 0.02)],
  );
  const filter = useTransform(scrollYProgress, [segmentStart, segmentEnd], [
    "brightness(1)",
    "brightness(0.92)",
  ]);

  return (
    <div
      className="sticky flex justify-center px-4 sm:px-6"
      style={{
        top: `calc(38vh + ${index * 1.75}rem)`,
        zIndex: index + 1,
        marginBottom: index === total - 1 ? 0 : "12vh",
      }}
    >
      <motion.article
        className="stack-step-card w-full max-w-lg rounded-xl border border-black/[.08] bg-white p-6 sm:p-7 text-center shadow-[0_8px_30px_rgba(15,23,42,0.08)] will-change-transform"
        style={{ scale, filter }}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff5ee]">
          <Image
            src={step.iconSrc}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6"
            aria-hidden="true"
          />
        </div>
        <p className="text-xs uppercase tracking-wide text-[#ff6a00]">
          Step {index + 1}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-black">{step.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-black/60">{step.desc}</p>
      </motion.article>
    </div>
  );
}

function MobileStackedCards({ steps }: { steps: Step[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTrackHeight = `${(steps.length - 1) * 85 + 55}vh`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.75", "end 0.35"],
  });

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[1120px]"
      style={{ minHeight: scrollTrackHeight }}
      aria-label="How Shaka works steps"
    >
      {steps.map((step, index) => (
        <StepCard
          key={step.title}
          step={step}
          index={index}
          total={steps.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}

export default function StackedStepCards({ steps }: StackedStepCardsProps) {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (shouldReduceMotion || !isMobile) {
    return (
      <div className="mx-auto mt-8 max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <DesktopStepCard
              key={step.title}
              step={step}
              index={index}
            />
          ))}
        </div>
      </div>
    );
  }

  return <MobileStackedCards steps={steps} />;
}
