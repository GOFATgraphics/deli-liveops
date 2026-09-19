import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Stagger, motion, rise } from "@/components/fm";
import { PublicPending } from "@/components/public/public-loading";
import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendContact } from "@/lib/public-data";
import { emailLooksValid } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  component: Contact,
  pendingComponent: PublicPending,
  head: () => ({
    meta: [
      { title: "Deli — Contact" },
      { name: "description", content: "Talk to the Deli desk in Kano." },
    ],
  }),
});

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const emailOk = emailLooksValid(email);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (emailOk === false) return;
    setBusy(true);
    try {
      await sendContact({ data: { name, email, phone, message } });
      toast.success("Message with the desk.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Stagger>
          <motion.p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase" variants={rise}>
            Desk
          </motion.p>
          <motion.h1 className="font-display mt-2 text-4xl tracking-tight" variants={rise}>
            Contact
          </motion.h1>
          <motion.p className="mt-3 text-sm text-muted" variants={rise}>
            Kano senders and fleets. We read every note.
          </motion.p>
          <motion.div className="mt-8 space-y-3 text-sm" variants={rise}>
            <p>
              <a className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40" href="tel:+2348037688289">
                +234 803 768 8289
              </a>
            </p>
            <p>
              <a className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40" href="mailto:desk@deli.ng">
                desk@deli.ng
              </a>
            </p>
          </motion.div>
        </Stagger>

        <motion.form
          className="flex flex-col gap-3 rounded-xl bg-raised p-5 shadow-[var(--shadow-hairline)]"
          onSubmit={(event) => void submit(event)}
          initial="hidden"
          animate="visible"
          variants={rise}
          aria-busy={busy}
        >
          <Field label="Name" htmlFor="contact-name">
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </Field>
          <Field label="Email" htmlFor="contact-email">
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-invalid={emailOk === false}
              aria-describedby={emailOk === false ? "contact-email-hint" : undefined}
            />
            {emailOk === false ? (
              <p id="contact-email-hint" className="text-xs text-muted" role="alert">
                Use a valid email.
              </p>
            ) : null}
          </Field>
          <Field label="Phone" htmlFor="contact-phone">
            <Input
              id="contact-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+234 …"
            />
          </Field>
          <Field label="Message" htmlFor="contact-message">
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={8}
            />
          </Field>
          <Button type="submit" disabled={busy || emailOk === false} className="mt-2">
            {busy ? "Sending…" : "Send to the desk"}
          </Button>
          {sent ? (
            <p className="text-sm text-muted" role="status">
              Received. We’ll reply from the desk.
            </p>
          ) : null}
        </motion.form>
      </div>
    </PublicShell>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
