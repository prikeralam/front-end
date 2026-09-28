import type { Metadata } from "next";
import { PageHeader } from "../_ui/kit";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
  // The link carries a one-time token in its query string; never send it to another site in a Referer header.
  referrer: "no-referrer",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * Where invite and password-reset emails land (`{FRONTEND_URL}/reset-password?uid=…&token=…`). Without a link it offers
 * to email one.
 */
export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const uid = first(params.uid);
  const token = first(params.token);
  const fromLink = !!uid && !!token;

  return (
    <>
      <PageHeader kicker="Account" title={fromLink ? "Set your password" : "Reset your password"} />
      <section className="mx-auto max-w-md px-6 py-16">
        <ResetPasswordForm uid={uid} token={token} />
      </section>
    </>
  );
}
