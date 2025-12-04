import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 phút - data ít thay đổi
        gcTime: 10 * 60 * 1000, // 10 phút - garbage collection time
        refetchOnWindowFocus: false, // Tắt refetch khi focus window
        refetchOnMount: false, // Tắt refetch khi mount nếu đã có data
        retry: 1, // Chỉ retry 1 lần thay vì 3 lần mặc định
        // retryDelay xác định thời gian chờ (ms) giữa các lần thử lại (retry) - tăng dần theo số lần thử.
        // Ví dụ: lần retry đầu là 1000ms, lần 2 là 2000ms, lần 3 là 4000ms... nhưng tối đa là 10000ms (10s).
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff, max 10s
      },
      mutations: {
        retry: 0, // Không retry mutations
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
