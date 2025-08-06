import { isSuperAdmin } from "@/lib/access";
import config from "@/payload.config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { id, reason } = (await request.json()) as {
      id: string;
      reason: string;
    };

    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!isSuperAdmin(user)) {
      return NextResponse.json(
        { message: "Only admins can approve launchpads" },
        { status: 403 }
      );
    }

    const launchpad = await payload.findByID({
      collection: "launchpads",
      id,
    });

    if (!launchpad) {
      return NextResponse.json(
        { message: "Launchpad not found" },
        { status: 404 }
      );
    }

    if (launchpad.status !== "pending") {
      return NextResponse.json(
        { message: "Can only reject pending launchpads" },
        { status: 400 }
      );
    }

    const updatedLaunchpad = await payload.update({
      collection: "launchpads",
      id: id,
      data: {
        status: "rejected",
        rejectionReason: reason,
      },
    });

    return NextResponse.json(updatedLaunchpad);
  } catch (error) {
    console.error("Reject error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
