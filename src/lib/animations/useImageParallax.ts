"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxOptions {
  speed?: number;
  direction?: "y" | "x";
  start?: string;
  end?: string;
  scrub?: boolean | number;
}

export const useImageParallax = (options: ParallaxOptions = {}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    speed = 0.3,
    direction = "y",
    start = "top bottom",
    end = "bottom top",
    scrub = true,
  } = options;

  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;

    const image = imageRef.current;
    const property = direction === "y" ? "y" : "x";
    const distance = speed * 100;

    gsap.fromTo(
      image,
      { [property]: -distance / 2 },
      {
        [property]: distance / 2,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          end,
          scrub,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [speed, direction, start, end, scrub]);

  return { imageRef, containerRef };
};

export default useImageParallax;
