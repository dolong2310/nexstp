import RefreshButton, { RefreshQueryKeys } from "@/components/refresh-button";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import LaunchpadList, {
  LaunchpadListSkeleton,
} from "../components/launchpad-list";
import LaunchpadSort from "../components/launchpad-sort";
import SearchInput from "../components/search-input";

const LaunchpadsView = () => {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-12 pt-4 pb-8">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8 py-4">
        <h1 className="flex-1 text-4xl font-bold">{t("Launchpad")}</h1>
        <p className="flex-1 text-sm text-foreground md:text-end">
          {t(
            "Get exclusive early access to amazing products at special launch prices Limited time offers before they return to regular pricing"
          )}
        </p>
      </section>

      <div className="flex items-center gap-2 py-4">
        <SearchInput />
        <LaunchpadSort />
        <RefreshButton
          queryKey={"launchpads" as RefreshQueryKeys}
          size="icon"
        />
      </div>

      <Suspense fallback={<LaunchpadListSkeleton />}>
        <LaunchpadList />
      </Suspense>
    </div>
  );
};

export const LaunchpadsViewSkeleton = () => {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-12 pt-4 pb-8">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8 py-4">
        <h1 className="flex-1 text-4xl font-bold">{t("Launchpad")}</h1>
        <p className="flex-1 text-sm text-foreground md:text-end">
          {t(
            "Get exclusive early access to amazing products at special launch prices Limited time offers before they return to regular pricing"
          )}
        </p>
      </section>

      <div className="flex items-center gap-2 py-4">
        <SearchInput disabled />
        <LaunchpadSort disabled />
      </div>

      <LaunchpadListSkeleton />
    </div>
  );
};

export default LaunchpadsView;
