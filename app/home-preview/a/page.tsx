import { loadHomeData } from "../../_lib/home/homeData";
import { pageMetadata } from "../../_lib/seo";
import HomeA from "../_ui/HomeA";

export const metadata = pageMetadata({ title: "Homepage preview A", description: "Homepage redesign, alternative A.", path: "/home-preview/a", noindex: true });

export default async function HomePreviewA() {
  return <HomeA data={await loadHomeData()} />;
}
