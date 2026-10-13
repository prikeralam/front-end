import type { Metadata } from "next";
import { PageHeader } from "../_ui/kit";
import { safeNext } from "../_lib/signup";
import VerifyEmail from "./VerifyEmail";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
  // The link carries a one-time token in its query string; never send it to another site in a Referer header.
  referrer: "no-referrer",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Where sign-up confirmation emails land (`{FRONTEND_URL}/verify-email?uid=…&token=…&next=/data/…`). */
export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <>
      <PageHeader compact kicker="Account" title="Confirm your email" />
      <section className="mx-auto max-w-md px-6 py-16">
        <VerifyEmail uid={first(params.uid)} token={first(params.token)} next={safeNext(first(params.next))} />
      </section>
    </>
  );
}
