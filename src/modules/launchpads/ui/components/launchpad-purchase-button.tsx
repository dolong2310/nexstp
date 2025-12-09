import { Button } from "@/components/ui/button";
import useSession from "@/hooks/use-session";
import { Link, useRouter } from "@/i18n/navigation";
import useCheckoutState from "@/modules/checkout/hooks/use-checkout-state";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface Props {
  launchpadId: string;
  isOwner: boolean;
  isPurchased: boolean;
}

const LaunchpadPurchaseButton = ({
  launchpadId,
  isOwner,
  isPurchased,
}: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const trpc = useTRPC();
  const { user } = useSession();

  const [states, setStates] = useCheckoutState();

  // Purchase mutation
  const purchaseMutation = useMutation(
    trpc.launchpads.purchase.mutationOptions({
      onMutate: () => {
        setStates({ success: false, cancel: false });
      },
      onSuccess: (data) => {
        // toast.success("Purchase successful! Check your library.");
        window.location.href = data.url;
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
        }
        toast.error(t(error.message) || t("Purchase failed"));
      },
    })
  );

  const renderPurchaseLabel = () => {
    if (user?.id && isOwner) return t("You own this launchpad");
    return (
      <>
        {purchaseMutation.isPending ? (
          <LoaderIcon className="size-5 animate-spin" />
        ) : (
          <ShoppingCart className="size-5" />
        )}
        <span>{t("Buy")}</span>
      </>
    );
  };

  const handlePurchase = () => {
    purchaseMutation.mutate({ launchpadId });
  };

  if (user?.id && isPurchased) {
    return (
      <Button
        asChild
        variant="default"
        className="w-full space-x-1 text-lg font-semibold"
      >
        <Link href={`/library/${launchpadId}`}>{t("View in Library")}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      className="w-full space-x-1 text-lg font-semibold"
      onClick={handlePurchase}
      disabled={(user?.id && isOwner) || purchaseMutation.isPending}
    >
      {renderPurchaseLabel()}
    </Button>
  );
};

export const LaunchpadPurchaseButtonSkeleton = () => {
  return (
    <Button disabled variant="default" className="w-full">
      <LoaderIcon className="size-4 animate-spin" />
    </Button>
  );
};

export default LaunchpadPurchaseButton;
