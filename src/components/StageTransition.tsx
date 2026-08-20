import type { PropsWithChildren } from 'react';
import { motion } from 'motion/react';

type StageTransitionProps = PropsWithChildren<{
  className?: string;
}>;

/**
 * A restrained page transition shared by all four stages. The small blur and
 * spring settle make navigation feel continuous without changing the layout.
 */
export function StageTransition({ children, className }: StageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.994, filter: 'blur(7px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, scale: 0.997, filter: 'blur(5px)' }}
      transition={{ type: 'spring', stiffness: 250, damping: 28, mass: 0.72 }}
      style={{ transformOrigin: '50% 16%' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
