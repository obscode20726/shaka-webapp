import { Variants } from "framer-motion";

// Premium easing curves inspired by Refero style
export const EASING = {
  luxury: [0.22, 1, 0.36, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
  cinematic: [0.16, 1, 0.3, 1] as const,
};

// Hero section variants - cinematic entrance
export const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

export const heroTextVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: EASING.cinematic,
    },
  },
};

export const heroButtonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASING.smooth,
    },
  },
};

// Section scroll reveal variants
export const sectionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const sectionHeaderVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: EASING.luxury,
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASING.luxury,
    },
  },
};

// Image parallax variants
export const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: EASING.cinematic,
    },
  },
};

// Premium hover interactions
export const cardHoverVariants = {
  hover: {
    y: -8,
    transition: {
      duration: 0.4,
      ease: EASING.smooth,
    },
  },
};

export const buttonHoverVariants = {
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.3,
      ease: EASING.smooth,
    },
  },
  tap: {
    scale: 0.97,
    transition: {
      duration: 0.15,
    },
  },
};

// Staggered list variants
export const staggeredContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const staggeredItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASING.luxury,
    },
  },
};

// Fade in from different directions
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASING.luxury,
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASING.luxury,
    },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: EASING.luxury,
    },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: EASING.luxury,
    },
  },
};

// Scale reveal
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: EASING.smooth,
    },
  },
};
