import Link from "next/link";
import type { AccessState } from "../../_lib/datasetTypes";

const buttonClass = "mt-8 inline-block rounded-full bg-[#253D9A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]";

/**
 * What a visitor can do with a dataset, decided by the server from the API's access state: `full` datasets carry a
 * downloadable file URL, `requestable` ones need a signed-in request, `locked` ones are staff-only.
 */
export default function DatasetAccessPanel({ accessState, downloadUrl }: { accessState: AccessState; downloadUrl: string | null }) {
  if (accessState === "full" && downloadUrl) {
    return (
      <a href={downloadUrl} download className={buttonClass}>
        Download
      </a>
    );
  }

  if (accessState === "requestable") {
    return (
      <div className="mt-8">
        <p className="text-sm text-[#5b5f74]">Access to this dataset is granted on request.</p>
        <Link href="/account" className="mt-3 inline-block rounded-full border border-[#253D9A] px-5 py-2.5 text-sm font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white">
          Sign in to request access
        </Link>
      </div>
    );
  }

  return <p className="mt-8 text-sm text-[#8b8fa3]">Restricted to internal staff roles.</p>;
}
