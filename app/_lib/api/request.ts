import { ApiError, describeErrorBody } from "./errors";

/** Unwraps an openapi-fetch result: returns `data`, or throws `ApiError` carrying the status and DRF detail. */
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }, path: string): T {
  if (result.data === undefined) throw new ApiError(result.response.status, describeErrorBody(result.error), path);
  return result.data;
}
