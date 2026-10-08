import { serializeJsonLd } from "../_lib/seo";

/** Structured data for search engines. The content is our own records, serialized with `<` escaped. */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
