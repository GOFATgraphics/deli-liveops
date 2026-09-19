import { motion, useReducedMotion } from "motion/react";
import { TRACK_STEPS, trackIndex } from "@/lib/sender-status";
import { cn } from "@/lib/utils";
import { rise } from "@/components/fm";

export function DeliveryTrack({ status }: { status: string }) {
  const index = trackIndex(status);
  const reduce = useReducedMotion();
  if (index < 0) {
    return <p className="text-sm text-muted">This run was cancelled.</p>;
  }

  return (
    <motion.ol
      className="flex flex-col"
      aria-label="Tracking"
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {TRACK_STEPS.map((step, i) => {
        const current = i === index;
        const done = i < index;
        const last = i === TRACK_STEPS.length - 1;
        return (
          <motion.li key={step.id} className="flex gap-3" variants={rise}>
            <div className="flex w-3 flex-col items-center">
              <motion.span
                className={cn(
                  "mt-1 size-2.5 shrink-0 rounded-full",
                  done || current ? "bg-fg" : "bg-border",
                )}
                animate={current && !reduce ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                transition={
                  current && !reduce ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined
                }
              />
              {last ? null : <span className={cn("w-px flex-1", done ? "bg-fg/40" : "bg-border")} />}
            </div>
            <div className={cn("min-w-0", last ? "pb-0" : "pb-4")}>
              <p className={cn("text-sm", current ? "font-medium text-fg" : "text-muted")}>{step.label}</p>
              {current ? <p className="mt-0.5 text-sm text-muted">{step.hint}</p> : null}
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
