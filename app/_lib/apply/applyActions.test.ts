import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("../api/client", () => ({ apiBaseUrl: () => "http://api.test" }));

let realIp = "203.0.113.1";
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-real-ip": realIp }) }));

const { submitApplicationAction } = await import("./applyActions");

const fetchMock = vi.fn();
let ip = 0;

const file = (name: string, size = 20) => new File([new Uint8Array(size)], name);

function application(fields: Record<string, string | File> = {}): FormData {
  const form = new FormData();
  const values: Record<string, string | File> = {
    kind: "fellowship",
    full_name: " Asha K ",
    email: " asha@example.org ",
    cv: file("cv.pdf"),
    sop: file("sop.docx"),
    ...fields,
  };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

const answer = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status });

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  realIp = `198.51.100.${++ip}`;
});

afterEach(() => vi.unstubAllGlobals());

describe("submitApplicationAction", () => {
  it("sends trimmed fields and both files as multipart to the backend", async () => {
    fetchMock.mockResolvedValueOnce(answer(201));
    expect(await submitApplicationAction(application())).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api.test/api/v1/apply/");
    const sent = init.body as FormData;
    expect([sent.get("kind"), sent.get("full_name"), sent.get("email"), sent.get("job")]).toEqual(["fellowship", "Asha K", "asha@example.org", null]);
    expect((sent.get("cv") as File).name).toBe("cv.pdf");
    expect((sent.get("sop") as File).name).toBe("sop.docx");
  });

  it("sends the role for a job application", async () => {
    fetchMock.mockResolvedValueOnce(answer(201));
    expect(await submitApplicationAction(application({ kind: "job", job: "data-analyst" }))).toEqual({ ok: true });
    expect((fetchMock.mock.calls[0][1].body as FormData).get("job")).toBe("data-analyst");
  });

  it("points at every invalid field without calling the backend", async () => {
    const result = await submitApplicationAction(application({ kind: "job", job: "", full_name: " ", email: "nope", cv: file("cv.exe"), sop: file("sop.pdf", 6 * 1024 * 1024) }));
    expect(result).toMatchObject({
      ok: false,
      fieldErrors: { job: expect.any(String), full_name: expect.any(String), email: expect.any(String), cv: expect.stringContaining("PDF or Word"), sop: expect.stringContaining("5 MB") },
    });
    const missing = new FormData();
    missing.set("kind", "teacher");
    expect(await submitApplicationAction(missing)).toMatchObject({ ok: false, fieldErrors: { kind: expect.any(String), cv: expect.any(String), sop: expect.any(String) } });
    expect(await submitApplicationAction(null as never)).toMatchObject({ ok: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers a filled honeypot as success and sends nothing", async () => {
    expect(await submitApplicationAction(application({ website: "http://spam.example" }))).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("limits one visitor to three applications an hour", async () => {
    fetchMock.mockImplementation(async () => answer(201));
    for (let i = 0; i < 3; i++) expect(await submitApplicationAction(application())).toEqual({ ok: true });
    expect(await submitApplicationAction(application())).toMatchObject({ ok: false, message: expect.stringContaining("several applications") });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("maps the backend's field errors, throttling and outages to messages", async () => {
    fetchMock.mockResolvedValueOnce(answer(400, { cv: ["This doesn't look like a .pdf file."], job: "Choose the role you are applying for." }));
    expect(await submitApplicationAction(application())).toEqual({
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: { cv: "This doesn't look like a .pdf file.", job: "Choose the role you are applying for." },
    });

    fetchMock.mockResolvedValueOnce(answer(429));
    expect(await submitApplicationAction(application())).toMatchObject({ ok: false, message: expect.stringContaining("lot of applications") });

    fetchMock.mockRejectedValueOnce(new Error("down"));
    expect(await submitApplicationAction(application())).toMatchObject({ ok: false, message: expect.stringContaining("couldn't reach") });
  });
});
