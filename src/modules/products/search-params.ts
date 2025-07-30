import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const sortValues = [
  "curated",
  "trending",
  "hot_and_new",
  "newest",
  "oldest",
] as const;

const params = {
  search: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
  }),
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

export const loadProductFilters = createLoader(params);

const gridValues = ["grid", "table"] as const;

export const layoutParams = {
  layout: parseAsStringLiteral(gridValues)
    .withOptions({
      clearOnDefault: true,
    })
    .withDefault("grid"),
};

export const loadProductLayout = createLoader(layoutParams);
