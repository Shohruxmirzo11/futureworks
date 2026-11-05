"use client";

import { MotionConfig, motion } from "motion/react";

// Har bir sahifaga o'tishda yengil paydo bo'lish animatsiyasi
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
