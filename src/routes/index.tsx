import { createFileRoute, Link } from "@tanstack/react-router";
import { MotionCard, Stagger, motion, rise } from "@/components/fm";
import { PublicPending } from "@/components/public/public-loading";
import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
  pendingComponent: PublicPending,
  head: () => ({
    meta: [
      { title: "Deli" },
      { name: "description", content: "Pickup and dropoff in Kano. Request, price, pay, track." },
    ],
  }),
});

const STEPS = [
  { n: "01", title: "Request", body: "Pickup and dropoff. A landmark in Kano is enough." },
  { n: "02", title: "Price", body: "The desk quotes a fleet. You accept or wait for another." },
  { n: "03", title: "Pay", body: "Paystack on the job. We hold it until delivery." },
  { n: "04", title: "Track", body: "Pickup, in transit, delivered — with a receiver code." },
];

function Home() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <Stagger className="max-w-xl">
          <motion.p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase" variants={rise}>
            Kano
          </motion.p>
          <motion.h1 className="font-display mt-3 text-5xl tracking-tight md:text-6xl" variants={rise}>
            Pickup and dropoff, same city.
          </motion.h1>
          <motion.p className="mt-4 text-base text-muted md:text-lg" variants={rise}>
            Deli is last-mile for shops and senders in Kano. File a run, pay once, watch it move.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" variants={rise}>
            <Button asChild>
              <Link to="/request">Request a pickup</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/contact">Talk to us</Link>
            </Button>
          </motion.div>
        </Stagger>
      </section>

      <section id="how" className="border-t border-border scroll-mt-20">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">How it works</p>
          <h2 className="font-display mt-2 text-3xl tracking-tight">Four steps. No chase.</h2>
          <Stagger className="mt-10 grid gap-4 md:grid-cols-4">
            {STEPS.map((step) => (
              <MotionCard key={step.n} className="rounded-xl bg-raised p-5 shadow-[var(--shadow-hairline)]">
                <p className="font-mono text-xs text-subtle">{step.n}</p>
                <h3 className="font-display mt-3 text-xl tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </MotionCard>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <h2 className="font-display text-3xl tracking-tight">Need a desk, not a form?</h2>
            <p className="mt-3 text-sm text-muted">
              Staff run LiveOps. Senders stay on their jobs. Search this site with the magnifying glass, or ⌘K.
            </p>
          </div>
          <Button variant="secondary" asChild>
            <Link to="/ops">Open LiveOps</Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
