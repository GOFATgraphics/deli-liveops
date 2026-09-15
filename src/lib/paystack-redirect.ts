/** Leave this app and open Paystack checkout. Popup is blocked in the preview. */
export function goToPaystack(url: string) {
  if (!url.startsWith("https://")) throw new Error("Paystack did not return a checkout link.");
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = url;
      return;
    }
  } catch {
    /* framed — fall through */
  }
  window.location.assign(url);
}
