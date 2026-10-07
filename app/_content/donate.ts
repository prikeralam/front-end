import type { ContentStatus } from "../_lib/types";

// PRI's Razorpay payment page (short link to pages.razorpay.com/pl_QyVerSDowAODeJ).
export const donatePayment = {
  razorpayUrl: "https://rzp.io/rzp/rKZ9EuY" as string | null,
  status: "real" as ContentStatus,
};

// PRI's UPI payment QR, as supplied by PRI (2026-10-07). Decoded and checked: it pays POLICYANDRESEARCHINITIATIVE at
// this UPI ID, the same HDFC account as below.
export const upiPayment = {
  qrImage: "/donate/upi-qr.jpeg",
  upiId: "policyandresearchini.70505116@hdfcbank",
};

// PRI's bank account for transfers, as supplied by PRI (2026-10-07).
export const bankDetails = {
  accountName: "POLICY AND RESEARCH INITIATIVE",
  accountNumber: "50200111567971",
  ifsc: "HDFC0004017",
  bankName: "HDFC Bank",
  branch: "Chemmad",
  status: "real" as ContentStatus,
};
