import { cn } from "@/lib/utils";

type PartnerPhotoProps = {
  src?: string;
  alt: string;
  className?: string;
};

export function PartnerPhoto({ src, alt, className }: PartnerPhotoProps) {
  if (!src) {
    const initial = alt.trim().slice(0, 1).toUpperCase() || "P";
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-fg/10 font-display text-muted",
          className,
        )}
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return <img src={src} alt={alt} className={cn("object-cover", className)} />;
}
