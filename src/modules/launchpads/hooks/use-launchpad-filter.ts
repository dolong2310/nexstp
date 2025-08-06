import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

export type SortValue = "priority" | "newest" | "ending-soon";

const sortLaunchpadValues = ["priority", "newest", "ending-soon"] as const;

export const params = {
  search: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  sort: parseAsStringLiteral(sortLaunchpadValues).withDefault("priority"),
};

const useLaunchpadFilter = () => {
  return useQueryStates(params);
};

export default useLaunchpadFilter;
