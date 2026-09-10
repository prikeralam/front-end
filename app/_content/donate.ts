import type { ContentStatus } from "../_lib/types";

// PLACEHOLDER — Razorpay payment link to be supplied by PRI.
export const donatePayment = {
  razorpayUrl: null as string | null,
  status: "placeholder" as ContentStatus,
};

// PLACEHOLDER — bank transfer details to be confirmed by PRI.
export const bankDetails = {
  accountName: "To be confirmed",
  accountNumber: "To be confirmed",
  ifsc: "To be confirmed",
  bankName: "To be confirmed",
  branch: "To be confirmed",
  status: "placeholder" as ContentStatus,
};
