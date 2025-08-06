import cron from "node-cron";
import {
  monitorExpiredLaunchpads,
  checkUpcomingExpiry,
} from "./launchpad-monitor";

export function startCronJobs() {
  // Chạy vào 0h và 12h mỗi ngày để check expired launchpads
  cron.schedule("0 0,12 * * *", async () => {
    console.log("Running launchpad monitor cron job...");
    try {
      await monitorExpiredLaunchpads();
      console.log("✅ Launchpad monitor completed successfully");
    } catch (error) {
      console.error("❌ Error in launchpad monitor:", error);
    }
  });

  // Chạy vào 0h và 12h mỗi ngày để check upcoming expiry
  cron.schedule("0 0,12 * * *", async () => {
    console.log("Running upcoming expiry check...");
    try {
      await checkUpcomingExpiry();
      console.log("✅ Upcoming expiry check completed successfully");
    } catch (error) {
      console.error("❌ Error in upcoming expiry check:", error);
    }
  });

  console.log("Cron jobs started");
}
