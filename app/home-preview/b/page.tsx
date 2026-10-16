import { loadHomeData } from "../../_lib/home/homeData";
import { pageMetadata } from "../../_lib/seo";
import HomeB from "../_ui/HomeB";

export const metadata = pageMetadata({ title: "Homepage preview B", description: "Homepage redesign, alternative B.", path: "/home-preview/b", noindex: true });

export default async function HomePreviewB() {
  return <HomeB data={await loadHomeData()} />;
}
