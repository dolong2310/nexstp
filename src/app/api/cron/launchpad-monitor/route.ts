import {
  monitorExpiredLaunchpads,
  checkUpcomingExpiry,
} from "@/lib/cron/launchpad-monitor";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Kiểm tra auth header hoặc secret key để bảo mật
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Manual cron job triggered for launchpad monitoring");

    // Chạy cả 2 functions
    const [expiredResult, upcomingResult] = await Promise.all([
      monitorExpiredLaunchpads(),
      checkUpcomingExpiry(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        expired: expiredResult,
        upcoming: upcomingResult,
      },
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Same logic as GET, cho phép cả GET và POST
  return GET(request);
}
