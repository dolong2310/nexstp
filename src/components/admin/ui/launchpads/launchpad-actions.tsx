"use client";

import { isSuperAdmin as isSuperAdminHelper } from "@/lib/access";
import { Tenant } from "@/payload-types";
import { Button, useAuth, useDocumentInfo } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const LaunchpadActions = () => {
  const { user } = useAuth();
  const document = useDocumentInfo();
  // console.log("document: ", document);
  const { initialData } = document;

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = user ? isSuperAdminHelper(user) : false; // user?.roles?.includes("super-admin");
  const isOwner = useMemo(() => {
    return (user?.tenants as { id: string; tenant: Tenant }[])?.some(
      (tenant) => {
        const tenantId = tenant.tenant.id;
        const docTenantId = initialData?.tenant as string;
        return tenantId === docTenantId;
      }
    );
  }, [user?.tenants, initialData?.tenant]);

  const handleAction = async (action: string, data?: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/launchpads/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: initialData?.id, ...data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Action failed");
      }

      // const result = await response.json();
      toast.success(`Action ${action} completed successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  const handleSubmitForApproval = () => handleAction("submit-for-approval");
  const handlePublish = () => handleAction("publish");
  const handleApprove = () => {
    const priority = prompt("Enter priority (optional):");
    handleAction("approve", priority ? { priority: parseInt(priority) } : {});
  };
  const handleReject = () => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      handleAction("reject", { reason });
    }
  };

  const colorStatus = useMemo(() => {
    switch (initialData?.status) {
      case "draft":
        return "gray";
      case "pending":
        return "yellow";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "white";
    }
  }, [initialData?.status]);

  // const isContentChanged = useMemo(() => {
  //   return initialData?.status === "rejected" && JSON.stringify(initialData) !== JSON.stringify(savedDocumentData);
  // }, [initialData, savedDocumentData]);

  if (!initialData) return null;

  return (
    <div className="launchpad-actions">
      {/* Status Display */}
      <div className="launchpad-actions__status">
        <span>Current Status:</span>
        <span
          className="launchpad-actions__status-text"
          style={{ color: colorStatus }}
        >
          {initialData?.status}
        </span>
      </div>

      {/* Tenant Actions */}
      {isOwner && (
        <>
          {["draft", "rejected"].includes(initialData?.status) && (
            <Button
              buttonStyle="pill"
              disabled={loading}
              onClick={handleSubmitForApproval}
            >
              Submit for Approval
            </Button>
          )}

          {initialData?.status === "approved" && (
            <Button
              buttonStyle="pill"
              disabled={loading}
              onClick={handlePublish}
            >
              Publish
            </Button>
          )}
        </>
      )}

      {/* Admin Actions */}
      {isSuperAdmin && (
        <>
          {initialData?.status === "pending" && (
            <>
              <Button
                buttonStyle="pill"
                disabled={loading}
                onClick={handleApprove}
              >
                Approve
              </Button>

              <Button
                buttonStyle="pill"
                disabled={loading}
                onClick={handleReject}
              >
                Reject
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};
