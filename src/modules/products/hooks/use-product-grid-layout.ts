import { parseAsStringLiteral, useQueryStates } from "nuqs";

const gridValues = ["grid", "table"] as const;

export const params = {
  layout: parseAsStringLiteral(gridValues)
    .withOptions({
      clearOnDefault: true,
    })
    .withDefault("grid"),
};

const useProductGridLayout = () => {
  return useQueryStates(params);
};

export default useProductGridLayout;
