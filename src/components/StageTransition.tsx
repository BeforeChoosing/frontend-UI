import type { PropsWithChildren } from 'react';
import { motion } from 'motion/react';

type StageTransitionProps = PropsWithChildren<{
  className?: string;
}>;

/**
 * A short GPU-only spring shared by all stages. Full-screen blur and scale are
 * intentionally avoided because they repaint the entire page during routing.
 */
export function StageTransition({ children, className }: StageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, transform: 'translateY(6px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      exit={{ opacity: 0, transform: 'translateY(-4px)' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.22 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
