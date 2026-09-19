import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();
  const dark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light" : "Dark"}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-md text-fg",
        "transition-colors duration-150 ease-out hover:bg-fg/5",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        className,
      )}
    >
      <span className="relative grid size-5 place-items-center" aria-hidden>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={dark ? "moon" : "sun"}
            initial={reduce ? false : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="absolute inset-0 grid place-items-center"
          >
            {dark ? <Moon className="size-5" /> : <Sun className="size-5" />}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
