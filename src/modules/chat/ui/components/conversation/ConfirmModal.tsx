"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useConversation from "@/modules/chat/hooks/use-conversation";
import axios from "axios";
import { AlertTriangleIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const ConfirmModal = ({ isOpen, onOpenChange }: Props) => {
  const router = useRouter();
  const { conversationId } = useConversation();
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = useCallback(() => {
    setIsLoading(true);
    axios
      .delete(`/api/conversations/${conversationId}`)
      .then(() => {
        router.push("/conversations");
        router.refresh();
      })
      .catch((error) => {
        console.log(error);
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
        onOpenChange(false);
      });
  }, [conversationId, router, onOpenChange]);

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogTrigger className="flex flex-col gap-3 items-center cursor-pointer hover:opacity-75">
          <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
            <TrashIcon />
          </div>
          <div className="text-sm font-light text-muted-foreground">Delete</div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="flex flex-row gap-4">
            <div className="mx-auto w-12 h-12 flex items-center justify-center shrink-0 rounded-full bg-destructive sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-white" />
            </div>
            <div>
              <AlertDialogTitle>Delete conversation</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                Are you sure you want to delete this conversation? This action
                cannot be undone.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmModal;
