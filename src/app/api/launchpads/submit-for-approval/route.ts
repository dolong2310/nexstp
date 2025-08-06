import { Tenant } from "@/payload-types";
import config from "@/payload.config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { id } = await request.json();

    // Get current session
    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get current launchpad
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

    // Check ownership
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

    // Check status
    if (!["draft", "rejected"].includes(launchpad.status)) {
      return NextResponse.json(
        { message: "Can only submit draft or rejected launchpads for approval" },
        { status: 400 }
      );
    }

    // Update status
    const updatedLaunchpad = await payload.update({
      collection: "launchpads",
      id,
      data: { status: "pending" },
    });

    return NextResponse.json(updatedLaunchpad);
  } catch (error) {
    console.error("Submit for approval error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
