import Link from "next/link";
import { notFound } from "next/navigation";
import { people } from "../../_content/people";
import { publications } from "../../_content/publications";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

const groupLabel: Record<string, string> = {
  team: "Team",
  patron: "Patron",
  executive: "Executive Council",
  fellow: "Fellow",
  "past-fellow": "Past Fellow",
  author: "Author",
};

const groupHref: Record<string, string> = {
  team: "/people/team",
  patron: "/people/patrons",
  executive: "/people/executive",
  author: "/research",
};

const groupBackLabel: Record<string, string> = {
  author: "Research",
};

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }));
}

export default async function PersonDetailV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = people.find((p) => p.slug === slug);
  if (!person) notFound();
  const authoredPublications = publications.filter((p) => p.authors.includes(person.slug));

  return (
    <>
      <PageHeader kicker={groupLabel[person.group] ?? "People"} title={person.name} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
          {person.photo && <MediaSlot need={person.photo} />}
          <div>
            <p className="flex items-center gap-2 text-[15px] font-semibold text-[#171a2b]">{person.role} <StatusTag status={person.status} /></p>
            {person.bio && <p className="mt-4 text-[15px] leading-relaxed text-[#5b5f74]">{person.bio}</p>}
          </div>
        </div>

        {person.group === "author" && (
          <div className="mt-10 rounded-xl border border-[#e6e8f0] bg-[#fafbfc] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Publications by this author</p>
            {authoredPublications.length === 0 ? (
              <p className="mt-2 text-sm text-[#8b8fa3]">No publications linked yet.</p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {authoredPublications.map((p) => (
                  <li key={p.slug} className="rounded-lg border border-[#e6e8f0] bg-white px-5 py-4">
                    <Link href={`/research/${p.slug}`} className="text-[15px] font-semibold text-[#171a2b] hover:text-[#253D9A]">
                      {p.title}
                    </Link>
                    <p className="mt-1 text-[13px] text-[#8b8fa3]">{p.format} &middot; {p.date}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Link href={groupHref[person.group] ?? "/people"} className="mt-10 inline-block text-sm font-semibold text-[#253D9A] hover:underline">
          &larr; Back to {groupBackLabel[person.group] ?? groupLabel[person.group] ?? "People"}
        </Link>
      </section>
    </>
  );
}
