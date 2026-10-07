import type { ContentStatus } from "../_lib/types";

// PRI's Razorpay payment page (short link to pages.razorpay.com/pl_QyVerSDowAODeJ).
export const donatePayment = {
  razorpayUrl: "https://rzp.io/rzp/rKZ9EuY" as string | null,
  status: "real" as ContentStatus,
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
