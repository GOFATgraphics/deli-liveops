import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstall = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos() {
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
}

export function InstallApp() {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstall | null>(null);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIos());
    setReady(true);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstall);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!ready || installed) return null;

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
      return;
    }
    const next = new URL(window.location.href);
    next.searchParams.set("install", "1");
    next.searchParams.set("platform", "ios");
    window.location.assign(next.toString());
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-raised px-4 py-4 shadow-[var(--shadow-hairline)]">
      <img src="/icon-192.png" alt="" className="size-12 shrink-0 rounded-xl" width={48} height={48} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Add Deli to your home screen</p>
        <p className="mt-0.5 text-sm text-muted">
          {ios ? "Opens with the Deli mark on your phone." : "Install the app. The Deli logo is the icon."}
        </p>
        <Button type="button" size="sm" className="mt-3" onClick={() => void install()}>
          {promptEvent ? "Install Deli" : ios ? "How to install" : "Install Deli"}
        </Button>
      </div>
    </div>
  );
}
