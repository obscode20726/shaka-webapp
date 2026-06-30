"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimationOptions {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  toggleActions?: string;
  markers?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

export const useScrollAnimation = () => {
  const containerRef = useRef<HTMLElement>(null);

  const animateFromBottom = (
    element: HTMLElement,
    options: ScrollAnimationOptions = {}
  ) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse",
          ...options,
        },
      }
    );
  };

  const animateFromTop = (
    element: HTMLElement,
    options: ScrollAnimationOptions = {}
  ) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: -60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse",
          ...options,
        },
      }
    );
  };

  const animateScale = (
    element: HTMLElement,
    options: ScrollAnimationOptions = {}
  ) => {
    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse",
          ...options,
        },
      }
    );
  };

  const animateParallax = (
    element: HTMLElement,
    speed: number = 0.5,
    options: ScrollAnimationOptions = {}
  ) => {
    gsap.to(element, {
      y: speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        ...options,
      },
    });
  };

  const animateImageZoom = (
    element: HTMLElement,
    options: ScrollAnimationOptions = {}
  ) => {
    gsap.fromTo(
      element,
      { scale: 1.1 },
      {
        scale: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse",
          ...options,
        },
      }
    );
  };

  const animateStaggered = (
    elements: HTMLElement[],
    options: ScrollAnimationOptions = {}
  ) => {
    gsap.fromTo(
      elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: elements[0],
          start: "top 85%",
          toggleActions: "play none none reverse",
          ...options,
        },
      }
    );
  };

  // Cleanup function
  const refreshScrollTrigger = () => {
    ScrollTrigger.refresh();
  };

  return {
    containerRef,
    animateFromBottom,
    animateFromTop,
    animateScale,
    animateParallax,
    animateImageZoom,
    animateStaggered,
    refreshScrollTrigger,
  };
};

export default useScrollAnimation;
