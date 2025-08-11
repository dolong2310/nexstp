import { Tenant } from "@/payload-types";
import { Button, Link } from "@payloadcms/ui";

type TenantWithId = {
  tenant: string | Tenant;
  id?: string | null;
};

export const StripeVerify = ({ user }: any) => {
  const isVerified = (user?.tenants as TenantWithId[]).some(
    (tenant) => (tenant?.tenant as Tenant)?.stripeDetailsSubmitted
  );

  if (isVerified) return null;
  return (
    <Link href="/stripe-verify">
      <Button>Verify account</Button>
    </Link>
  );
};
