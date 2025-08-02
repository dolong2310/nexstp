import { Tenant, User } from "@/payload-types";
import { ClientUser } from "payload";

export const isSuperAdmin = (user: User | ClientUser | null) => {
  return Boolean(user?.roles?.includes("super-admin"));
};

export const isOwnerOrSuperAdmin = (user: User, tenantId: string) => {
  if (isSuperAdmin(user)) {
    return true;
  }

  if (!tenantId) {
    return false;
  }

  const userTenantIds = (user.tenants || []).map((tenant) => {
    return (tenant.tenant as Tenant).id;
  });
  return userTenantIds.includes(tenantId);
};
