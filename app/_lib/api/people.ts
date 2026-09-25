import "server-only";
import type { Person } from "../types";
import { api } from "./client";
import { ApiError, describeErrorBody } from "./errors";
import { collectAllPages } from "./pagination";
import { toPerson } from "./personAdapter";

const PEOPLE_PATH = "/api/v1/people/";

/** Published people in one group, following pagination. Throws `ApiError` on any non-2xx response. */
export async function listPeopleByGroup(group: Person["group"]): Promise<Person[]> {
  const profiles = await collectAllPages(async (page) => {
    const { data, error, response } = await api.GET(PEOPLE_PATH, { params: { query: { group, page } } });
    if (!data) throw new ApiError(response.status, describeErrorBody(error), PEOPLE_PATH);
    return data;
  });
  return profiles.map((profile) => toPerson(profile, group));
}
