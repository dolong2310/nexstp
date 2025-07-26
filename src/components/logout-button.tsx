"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useSession from "@/modules/conversations/hooks/use-session";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOutIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface Props {
  iconClassName?: string;
}

const LogoutButton = ({ iconClassName }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { session, isLoading } = useSession();

  const logout = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.auth.session.queryOptions());
        router.push("/");
      },
      onError: (error) => {
        toast.error(
          error.message ||
            "An error occurred while logging out. Please try again."
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
      <Button variant="elevated" size="icon" disabled>
        <LogOutIcon className={iconClassName} />
      </Button>
    );

  if (!session?.user && !isLoading) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="elevated" size="icon">
          <LogOutIcon className={iconClassName} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-background flex items-center gap-2 w-fit">
        <span className="font-medium text-center">You want to</span>
        <Button variant="elevated" size="sm" onClick={handleLogout}>
          sign out
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default LogoutButton;
