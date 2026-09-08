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
  team: "/v1/people/team",
  patron: "/v1/people/patrons",
  executive: "/v1/people/executive",
};

export function generateStaticParams() {
  return people.map((p) => ({ slug: p.slug }));
}

export default async function PersonDetailV1({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = people.find((p) => p.slug === slug);
  if (!person) notFound();

  return (
    <>
      <PageHeader kicker={groupLabel[person.group] ?? "People"} title={person.name} />
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="grid gap-8 sm:grid-cols-[200px_1fr]">
          {person.photo && <MediaSlot need={person.photo} />}
          <div>
            <p className="flex items-center gap-2 text-[15px] text-[#171a2b]">
              {person.role} <StatusTag status={person.status} />
            </p>
            {person.bio && <p className="mt-4 text-[15px] leading-relaxed text-[#5b5f74]">{person.bio}</p>}
          </div>
        </div>
        <div className="mt-10 border-t border-[#243D9A]/10 pt-6">
          <Link href={groupHref[person.group] ?? "/v1/people"} className="text-sm text-[#243D9A] hover:underline">
            &larr; Back to {groupLabel[person.group] ?? "People"}
          </Link>
        </div>
      </section>
    </>
  );
}
