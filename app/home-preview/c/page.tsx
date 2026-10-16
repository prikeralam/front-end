import { loadHomeData } from "../../_lib/home/homeData";
import { pageMetadata } from "../../_lib/seo";
import HomeC from "../_ui/HomeC";

export const metadata = pageMetadata({ title: "Homepage preview C", description: "Homepage redesign, alternative C.", path: "/home-preview/c", noindex: true });

export default async function HomePreviewC() {
  return <HomeC data={await loadHomeData()} />;
}
