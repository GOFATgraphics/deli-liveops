import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide uppercase",
  {
    variants: {
      tone: {
        live: "bg-live/12 text-live",
        paused: "bg-paused/12 text-paused",
        muted: "bg-fg/6 text-muted",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}

export { Badge };
