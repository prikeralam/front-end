import "server-only";
import type { PRIDocument } from "../types";
import { api } from "./client";
import { toDocument } from "./contentAdapters";
import { collectAllPages } from "./pagination";
import { unwrap } from "./request";

const DOCUMENTS_PATH = "/api/v1/documents/";

/** Published documents of one type (e.g. "annual-report"), newest year first. */
export async function listDocuments(documentType: string): Promise<PRIDocument[]> {
  const documents = await collectAllPages(async (page) =>
    unwrap(await api.GET(DOCUMENTS_PATH, { params: { query: { document_type: documentType, page } } }), DOCUMENTS_PATH),
  );
  return documents.sort((a, b) => (b.year ?? 0) - (a.year ?? 0)).map(toDocument);
}
