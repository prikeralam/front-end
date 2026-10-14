/**
 * After a deploy, a page opened before it still calls the old build's Server Actions; the new server doesn't know
 * them and answers with this header (Next's UnrecognizedActionError). Seeing it means the tab is out of date.
 */
export const ACTION_NOT_FOUND_HEADER = "x-nextjs-action-not-found";
export const SITE_UPDATED_EVENT = "pri-site-updated";

export function isStaleDeploymentResponse(response: Pick<Response, "headers">): boolean {
  return response.headers.get(ACTION_NOT_FOUND_HEADER) === "1";
}
