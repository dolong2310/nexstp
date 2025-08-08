"use client";

import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import useConversation from "@/modules/conversations/hooks/use-conversation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangleIcon, LoaderIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConfirmModal = ({ isOpen, onOpenChange }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const { conversationId } = useConversation();

  const deleteConversation = useMutation(
    trpc.conversations.deleteConversation.mutationOptions({
      onSuccess: () => {
        router.push("/conversations");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong.");
      },
      onSettled: () => {
        onOpenChange(false);
      },
    })
  );

  const onDelete = useCallback(() => {
    deleteConversation.mutate({
      conversationId,
    });
  }, [conversationId, router, onOpenChange]);

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>
          <div className="flex flex-col gap-3 items-center cursor-pointer hover:opacity-75">
            <Button variant="default" size="icon">
              <TrashIcon />
            </Button>
            <div className="text-sm font-light text-foreground">
              Delete
            </div>
          </div>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button asChild variant="neutral">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </Button>
            <Button asChild variant="default">
              <AlertDialogAction
                onClick={onDelete}
                disabled={deleteConversation.isPending}
              >
                {deleteConversation.isPending ? (
                  <LoaderIcon className="size-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmModal;
