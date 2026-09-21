"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// Opacity-only — no transform. Used for dense grids (listing cards) where a
// translateY on every item creates overlapping GPU-composited layers that
// can paint as stray smears/shapes during the reveal, especially over a
// remote/virtualized browser preview.
const fadeOnlyVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: stagger }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeOnlyVariants}
      transition={{ duration: 0.35, ease: "easeOut" }}
      // min-w-0 overrides the grid item default of `min-width: auto`, which
      // otherwise refuses to shrink below the content's intrinsic width and
      // pushes cards past their grid track (most visible on narrow/mobile
      // viewports with long unbroken text).
      className={cn("min-w-0", className)}
    >
      {children}
    </motion.div>
  );
}
