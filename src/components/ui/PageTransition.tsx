"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] as const // Fixed: as const ensures this is a cubic-bezier tuple, not a generic number array
      }}
      className="w-full flex-1 flex flex-col items-center"
    >
      {children}
    </motion.div>
  );
}
