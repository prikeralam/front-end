import { beforeEach, describe, expect, it, vi } from "vitest";

const getJobDescriptionUrl = vi.fn();
vi.mock("../../../../_lib/api/engage", () => ({ getJobDescriptionUrl: (slug: string) => getJobDescriptionUrl(slug) }));

const { GET } = await import("./route");
const call = (slug: string) => GET(new Request(`http://site.test/careers/jobs/${slug}/job-description`), { params: Promise.resolve({ slug }) });

beforeEach(() => getJobDescriptionUrl.mockReset());

describe("job description link", () => {
  it("redirects to the file's current link", async () => {
    getJobDescriptionUrl.mockResolvedValueOnce("https://bucket.example/jobs/jd.pdf?sig=1");
    const response = await call("research-assistant");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://bucket.example/jobs/jd.pdf?sig=1");
    expect(getJobDescriptionUrl).toHaveBeenCalledWith("research-assistant");
  });

  it("answers 404 for a role without a PDF or an odd slug, and 502 when the backend fails", async () => {
    getJobDescriptionUrl.mockResolvedValueOnce(null);
    expect((await call("data-analyst")).status).toBe(404);
    expect((await call("../admin")).status).toBe(404);
    expect(getJobDescriptionUrl).toHaveBeenCalledTimes(1);
    getJobDescriptionUrl.mockRejectedValueOnce(new Error("down"));
    expect((await call("data-analyst")).status).toBe(502);
  });
});
