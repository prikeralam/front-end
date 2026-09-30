import CmsScreen from "../../_ui/CmsScreen";

export default function ManageMentions() {
  return <CmsScreen type="mention" section="Content" title="Cited in" intro="Where PRI's research and data have been cited or covered, shown on the public Cited in page." newLabel="New mention" filterField="kind" />;
}
