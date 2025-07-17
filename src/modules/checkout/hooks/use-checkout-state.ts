import { parseAsBoolean, useQueryStates } from "nuqs";

const useCheckoutState = () => {
  return useQueryStates({
    success: parseAsBoolean.withDefault(false).withOptions({
      clearOnDefault: true,
    }),
    cancel: parseAsBoolean.withDefault(false).withOptions({
      clearOnDefault: true,
    }),
  });
};

export default useCheckoutState;
