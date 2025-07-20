"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOutIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const LogoutButton = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());
  const logout = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.auth.session.queryOptions());
      },
      onError: (error) => {
        toast.error(
          error.message ||
            "An error occurred while logging out. Please try again."
        );
      },
    })
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate();
    setIsOpen(false);
  };

  if (!session.data?.user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="elevated" size="icon">
          <LogOutIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-background flex items-center gap-2 w-fit">
        <span className="font-medium text-center">You want to</span>
        <Button
          variant="elevated"
          size="sm"
          onClick={handleLogout}
        >
          sign out
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default LogoutButton;
