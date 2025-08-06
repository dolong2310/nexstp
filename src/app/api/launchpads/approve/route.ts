import { isSuperAdmin } from "@/lib/access";
import config from "@/payload.config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { id, priority } = (await request.json()) as {
      id: string;
      priority?: number;
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
        { message: "Can only approve pending launchpads" },
        { status: 400 }
      );
    }

    const updateData: any = {
      status: "approved",
    };

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    const updatedLaunchpad = await payload.update({
      collection: "launchpads",
      id: id,
      data: updateData,
    });

    return NextResponse.json(updatedLaunchpad);
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
