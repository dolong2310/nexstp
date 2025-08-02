// Using node-cron (Development)

import cron from 'node-cron';
import { monitorExpiredLaunchpads, checkUpcomingExpiry } from './launchpad-monitor';

export function startCronJobs() {
  console.log(123, 'Starting cron jobs...');
  // Chạy mỗi 1 phút để check expired launchpads
  cron.schedule('*/1 * * * *', async () => {
    console.log('Running launchpad monitor cron job...');
    await monitorExpiredLaunchpads();
  });

  // Chạy mỗi 1 phút để check upcoming expiry
  cron.schedule('*/1 * * * *', async () => {
    console.log('Running upcoming expiry check...');
    await checkUpcomingExpiry();
  });

  console.log('Cron jobs started');
}