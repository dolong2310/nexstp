// Import ở đầu file
import { startCronJobs } from "@/lib/cron/scheduler";

// Trong component hoặc API route
if (process.env.NODE_ENV === "development") {
  startCronJobs();
}
