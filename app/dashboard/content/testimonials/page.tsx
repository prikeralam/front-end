import type { Metadata } from "next";
import CmsScreen from "../../_ui/CmsScreen";

export const metadata: Metadata = { title: "Testimonials" };

export default function ManageTestimonials() {
  return <CmsScreen type="testimonial" section="Content" title="Testimonials" intro="Quotes shown in the site's testimonial strips." newLabel="New testimonial" />;
}
