import Link from "next/link";
import { notFound } from "next/navigation";
import { people } from "../../../_content/people";
import { PageHeader, StatusTag } from "../../_ui/kit";
import MediaSlot from "../../_ui/MediaSlot";

const groupLabel: Record<string, string> = {
  team: "Team",
  patron: "Patron",
  executive: "Executive Council",
};

const groupHref: Record<string, string> = {
  team: "/v3/people/team",
  patron: "/v3/people/patrons",
  executive: "/v3/people/executive",
};

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }));
}

export default async function PersonDetailV3({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = people.find((p) => p.slug === slug);
  if (!person) notFound();

  return (
    <>
      <PageHeader kicker={groupLabel[person.group] ?? "People"} title={person.name} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
          {person.photo && <MediaSlot need={person.photo} />}
          <div>
            <p className="flex items-center gap-2 text-[15px] font-semibold text-[#4A1B26]">
              {person.role} <StatusTag status={person.status} />
            </p>
            {person.bio && <p className="mt-4 text-[15px] leading-relaxed text-[#5b5f74]">{person.bio}</p>}
          </div>
        </div>
        <div className="mt-10 border-t border-[#e6dbc7] pt-6">
          <Link href={groupHref[person.group] ?? "/v3/people"} className="text-sm font-semibold text-[#243D9A] hover:underline">
            &larr; Back to {groupLabel[person.group] ?? "People"}
          </Link>
        </div>
      </section>
    </>
  );
}
