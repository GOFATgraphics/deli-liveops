import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMySender } from "@/lib/sender-data";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: search.next === "/admin" ? ("/admin" as const) : ("/" as const),
  }),
  component: Login,
  head: () => ({
    meta: [{ title: "Deli — Sign in" }],
  }),
});

function keepSession(data: { token?: string | null } | null | undefined) {
  const token = data?.token;
  if (!token || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem("grok-auth.bearer-token", token);
  } catch {
    /* preview storage can be blocked */
  }
}

function Login() {
  const { next } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg p-6">
        <div className="h-40 w-full max-w-sm animate-pulse rounded-xl bg-raised" />
      </main>
    );
  }
  if (user) return <Navigate to={next} />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!authEnabled) throw new Error("Sign-in is disabled.");
      if (mode === "up") {
        const { data, error: signUpError } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
        });
        if (signUpError) throw new Error(signUpError.message || "Could not create the account.");
        keepSession(data);
        await authClient.getSession();
        try {
          await saveMySender({ data: { name: name.trim(), phone: phone.trim() } });
        } catch {
          /* phone is collected again on the sender home if this fails */
        }
      } else {
        const { data, error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (signInError) throw new Error(signInError.message || "Email or password is wrong.");
        keepSession(data);
        await authClient.getSession();
      }
      window.location.assign(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="font-display text-3xl tracking-tight">Deli</p>
        <p className="mt-1 text-xs font-medium tracking-[0.18em] text-subtle uppercase">Sender</p>
        <h1 className="font-display mt-6 text-2xl tracking-tight">
          {mode === "in" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Email and password to sign in. Your phone is the number we call about the job.
        </p>

        {authEnabled ? (
          <form className="mt-6 flex flex-col gap-3" onSubmit={(event) => void submit(event)}>
            {mode === "up" ? (
              <>
                <Field label="Business name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" required />
                </Field>
                <Field label="Business phone">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+234 …"
                    required
                  />
                </Field>
              </>
            ) : null}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                minLength={8}
                required
              />
            </Field>
            {error ? <p className="text-sm text-fg">{error}</p> : null}
            <Button type="submit" disabled={busy} className="mt-1 w-full">
              {busy ? "Working…" : mode === "in" ? "Sign in" : "Create account"}
            </Button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
        )}

        {authEnabled ? (
          <>
            <p className="mt-4 text-center text-sm text-muted">
              {mode === "in" ? (
                <button type="button" className="underline-offset-4 hover:underline" onClick={() => setMode("up")}>
                  Create an account
                </button>
              ) : (
                <button type="button" className="underline-offset-4 hover:underline" onClick={() => setMode("in")}>
                  Already have an account
                </button>
              )}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs tracking-[0.16em] text-subtle uppercase">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {GROK_PROVIDERS.map((provider) => (
                <Button
                  key={provider.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() =>
                    void signIn(provider.providerId, { callbackURL: next, errorCallbackURL: "/login" })
                  }
                >
                  Continue with {provider.label}
                </Button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
