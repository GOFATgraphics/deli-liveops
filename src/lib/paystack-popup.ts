type PaystackPopCtor = {
  new (): {
    resumeTransaction: (
      accessCode: string,
      callbacks?: {
        onSuccess?: (transaction: { reference: string }) => void;
        onCancel?: () => void;
      },
    ) => void;
    checkout?: (opts: {
      accessCode: string;
      onSuccess?: (transaction: { reference: string }) => void;
      onCancel?: () => void;
    }) => void;
  };
};

declare global {
  interface Window {
    PaystackPop?: PaystackPopCtor;
  }
}

function loadScript() {
  if (window.PaystackPop) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-paystack="v2"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Could not load Paystack")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.dataset.paystack = "v2";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Paystack"));
    document.head.appendChild(script);
  });
}

export async function openPaystackCheckout(accessCode: string) {
  await loadScript();
  const Ctor = window.PaystackPop;
  if (!Ctor) throw new Error("Paystack did not load");
  const popup = new Ctor();
  return new Promise<{ reference: string }>((resolve, reject) => {
    const callbacks = {
      onSuccess: (transaction: { reference: string }) => resolve(transaction),
      onCancel: () => reject(new Error("Payment cancelled")),
    };
    if (typeof popup.checkout === "function") {
      popup.checkout({ accessCode, ...callbacks });
      return;
    }
    popup.resumeTransaction(accessCode, callbacks);
  });
}
