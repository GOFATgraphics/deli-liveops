import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const rise = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: easeOut },
  },
};

export function PageTransition({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("relative min-h-0", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={id}
          className="h-full min-h-0 overflow-hidden"
          initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            reduce
              ? undefined
              : { opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.15, ease: "easeIn" } }
          }
          transition={{ duration: 0.32, ease: easeOut }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function Stagger({ className, children }: { className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionCard({ className, children, ...props }: HTMLMotionProps<"article">) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      variants={rise}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.18, ease: easeOut }}
      className={className}
      {...props}
    >
      {children}
    </motion.article>
  );
}

export function MotionList({
  className,
  children,
  fast = false,
}: {
  className?: string;
  children: ReactNode;
  fast?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.ul
      className={className}
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: fast ? 0.02 : 0.05 } },
      }}
    >
      {children}
    </motion.ul>
  );
}

export function MotionItem({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.li variants={rise} className={className}>
      {children}
    </motion.li>
  );
}

export function OpsTransition({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("relative flex min-h-0 flex-col", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={id}
          className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.16, ease: easeOut }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Fast drawer / detail panel for LiveOps — opacity + 12px slide, ~160ms. */
export function OpsPanel({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={id}
      className={className}
      initial={reduce ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 8, transition: { duration: 0.1 } }}
      transition={{ duration: 0.16, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export { AnimatePresence, motion };
