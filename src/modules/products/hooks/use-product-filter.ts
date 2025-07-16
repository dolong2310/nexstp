import { parseAsString, useQueryStates } from "nuqs";

const useProductFilter = () => {
  return useQueryStates({
    minPrice: parseAsString.withOptions({
      clearOnDefault: true,
    }),
    maxPrice: parseAsString.withOptions({
      clearOnDefault: true,
    }),
  });
};

export default useProductFilter;
