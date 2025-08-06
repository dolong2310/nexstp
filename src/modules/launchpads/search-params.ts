import {
  createLoader,
  parseAsString,
  parseAsStringLiteral
} from "nuqs/server";

// export type SortValue = "priority" | "newest" | "ending-soon";

const sortLaunchpadValues = ["priority", "newest", "ending-soon"] as const;

export const params = {
  search: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  sort: parseAsStringLiteral(sortLaunchpadValues).withDefault("priority"),
};

export const loadLaunchpadFilters = createLoader(params);
