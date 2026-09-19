import { Link } from "@tanstack/react-router";
import { Stagger, motion, rise } from "@/components/fm";
import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Stagger>
          <motion.p className="font-mono text-sm text-muted" variants={rise}>
            404
          </motion.p>
          <motion.h1 className="font-display mt-2 text-4xl tracking-tight" variants={rise}>
            This page isn’t in Kano.
          </motion.h1>
          <motion.p className="mt-3 text-sm text-muted" variants={rise}>
            That address doesn’t match a Deli page. Head home, or ask the desk.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap items-center justify-center gap-3" variants={rise}>
            <Button asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/contact">Contact</Link>
            </Button>
          </motion.div>
        </Stagger>
      </div>
    </PublicShell>
  );
}
