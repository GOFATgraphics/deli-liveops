import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const blockPagePinch = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".leaflet-container")) return;
      event.preventDefault();
    };
    document.addEventListener("gesturestart", blockPagePinch, { passive: false });
    document.addEventListener("gesturechange", blockPagePinch, { passive: false });
    return () => {
      document.removeEventListener("gesturestart", blockPagePinch);
      document.removeEventListener("gesturechange", blockPagePinch);
    };
  }, []);
  return null;
}
