import type { JobStatus } from "@/lib/ops-data";

export const CODE_STATUSES: JobStatus[] = [
  "paid",
  "assigned",
  "picked_up",
  "in_transit",
  "delivery_confirmation_pending",
  "delivered",
  "settlement_pending",
  "settled",
];

export const ACTION_STATUSES: JobStatus[] = ["quoted", "accepted", "payment_pending"];

export const UNPAID_STATUSES: JobStatus[] = [
  "requested",
  "quote_pending",
  "quoted",
  "accepted",
  "payment_pending",
];

export const LIVE_TRACK_STATUSES: JobStatus[] = [
  "paid",
  "assigned",
  "picked_up",
  "in_transit",
  "delivery_confirmation_pending",
];

export function needsSenderAction(status: string) {
  return ACTION_STATUSES.includes(status as JobStatus);
}

export function canCancelSenderJob(status: string) {
  return UNPAID_STATUSES.includes(status as JobStatus);
}

export function isLiveTrack(status: string) {
  return LIVE_TRACK_STATUSES.includes(status as JobStatus);
}

export function senderStatus(status: string): { label: string; hint: string } {
  switch (status) {
    case "requested":
    case "quote_pending":
      return { label: "Waiting for a price", hint: "The desk is quoting this run." };
    case "quoted":
      return { label: "Price ready", hint: "Accept to pay. The receiver code comes after." };
    case "accepted":
    case "payment_pending":
      return { label: "Pay now", hint: "Paystack — card, bank, USSD, or OPay." };
    case "paid":
      return { label: "Paid", hint: "Waiting for pickup." };
    case "assigned":
      return { label: "Rider assigned", hint: "A fleet is coming for pickup." };
    case "picked_up":
      return { label: "Picked up", hint: "Goods are with the rider." };
    case "in_transit":
      return { label: "In transit", hint: "Heading to dropoff." };
    case "delivery_confirmation_pending":
      return { label: "At dropoff", hint: "Receiver shows the 4-digit code." };
    case "delivered":
    case "settlement_pending":
    case "settled":
      return { label: "Delivered", hint: "Run complete." };
    case "cancelled":
    case "failed":
      return { label: "Cancelled", hint: "This run did not complete." };
    case "disputed":
      return { label: "Disputed", hint: "The desk is reviewing this run." };
    case "refund_pending":
    case "refunded":
      return { label: "Refunded", hint: "Payment was returned." };
    default:
      return { label: status.replaceAll("_", " "), hint: "" };
  }
}

export const TRACK_STEPS = [
  { id: "request", label: "Requested", hint: "The desk is quoting this run." },
  { id: "price", label: "Priced", hint: "Accept the price, then pay." },
  { id: "pay", label: "Paid", hint: "Waiting for pickup." },
  { id: "pickup", label: "Picked up", hint: "Goods are with the rider." },
  { id: "transit", label: "In transit", hint: "Heading to dropoff." },
  { id: "done", label: "Delivered", hint: "Run complete." },
] as const;

export function trackIndex(status: string): number {
  if (["delivered", "settlement_pending", "settled"].includes(status)) return 5;
  if (["in_transit", "delivery_confirmation_pending"].includes(status)) return 4;
  if (status === "picked_up") return 3;
  if (["paid", "assigned"].includes(status)) return 2;
  if (["quoted", "accepted", "payment_pending"].includes(status)) return 1;
  if (["cancelled", "failed", "refunded"].includes(status)) return -1;
  return 0;
}
