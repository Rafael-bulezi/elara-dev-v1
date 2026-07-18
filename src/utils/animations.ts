import { Variants, Transition } from "motion/react";

export const defaultTransition: Transition = {
  duration: 0.4,
  ease: "easeOut"
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: defaultTransition },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

export const viewVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: defaultTransition },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, y: 100 }
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: defaultTransition },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};
