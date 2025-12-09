"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PRIVATE_PATHS } from "@/constants";
import useSession from "@/hooks/use-session";
import { useUserStore } from "@/modules/auth/store/use-user-store";
import { useGlobalStore } from "@/store/use-global-store";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOutIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { toast } from "./custom-toast";
import { Button } from "./ui/button";

interface Props {
  iconClassName?: string;
  isLabel?: boolean;
  labelClassName?: string;
}

const LogoutButton = ({ iconClassName, isLabel, labelClassName }: Props) => {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { user, isLoading } = useSession();

  const setForceLogout = useGlobalStore((state) => state.setForceLogout);
  const removeUser = useUserStore((state) => state.remove);

  const logout = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: async () => {
        setForceLogout(true);
        removeUser();
        queryClient.invalidateQueries(trpc.auth.session.queryOptions());
        if (PRIVATE_PATHS.includes(pathname)) {
          router.push("/");
        } else {
          router.refresh();
        }
      },
      onError: (error) => {
        toast.error(
          t(error.message) ||
            t("An error occurred while logging out Please try again")
        );
      },
      onSettled: () => {
        router.refresh();
      },
    })
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate();
    setIsOpen(false);
  };

  if (isLoading)
    return (
      <Button variant="default" size="icon" disabled>
        <LogOutIcon className={iconClassName} />
      </Button>
    );

  if (!user && !isLoading) return null;

  if (isLabel) {
    return (
      <p className={labelClassName} onClick={handleLogout}>
        {t("Sign out")}
      </p>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="neutral" size="icon">
          <LogOutIcon className={iconClassName} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="bg-secondary-background flex items-center gap-2 w-fit"
      >
        <span className="font-medium text-center">{t("You want to")}</span>
        <Button variant="default" size="sm" onClick={handleLogout}>
          {t("sign out")}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default LogoutButton;
