import { Tenant } from "@/payload-types";
import config from "@/payload.config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { id } = await request.json();

    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    // Check ownership and status
    const launchpadTenantId = (launchpad.tenant as Tenant).id;
    const userTenantIds = (user.tenants || []).map((tenant) => {
      return (tenant.tenant as Tenant).id;
    });
    const isOwner = userTenantIds.includes(launchpadTenantId);
    if (!isOwner) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }
    // const tenantId = (user.tenants?.[0]?.tenant as Tenant).id;
    // if ((launchpad.tenant as Tenant).id !== tenantId) {
    //   return NextResponse.json({ message: "Access denied" }, { status: 403 });
    // }

    if (launchpad.status !== "approved") {
      return NextResponse.json(
        { message: "Can only publish approved launchpads" },
        { status: 400 }
      );
    }

    const now = new Date();
    const endTime = new Date(
      now.getTime() + launchpad.duration * 60 * 60 * 1000
    );

    const updatedLaunchpad = await payload.update({
      collection: "launchpads",
      id,
      data: {
        status: "live",
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
      },
    });

    return NextResponse.json(updatedLaunchpad);
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
