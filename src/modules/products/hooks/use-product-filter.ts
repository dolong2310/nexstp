import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

const sortValues = [
  "curated",
  "trending",
  "hot_and_new",
  "newest",
  "oldest",
] as const;

export const params = {
  minPrice: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  maxPrice: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
  tags: parseAsArrayOf(parseAsString).withDefault([]).withOptions({
    clearOnDefault: true,
  }),
  sort: parseAsStringLiteral(sortValues).withDefault("curated"),
};

const useProductFilter = () => {
  return useQueryStates(params);
};

export default useProductFilter;
