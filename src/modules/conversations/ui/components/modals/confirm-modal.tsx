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
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import useConversation from "@/modules/conversations/hooks/use-conversation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConfirmModal = ({ isOpen, onOpenChange }: Props) => {
  const t = useTranslations();
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
        toast.error(t(error.message) || t("Something went wrong!"));
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
              {t("Delete")}
            </div>
          </div>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete conversation")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "Are you sure you want to delete this conversation? This action cannot be undone"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button asChild variant="neutral">
              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            </Button>
            <Button asChild variant="default">
              <AlertDialogAction
                onClick={onDelete}
                disabled={deleteConversation.isPending}
              >
                {deleteConversation.isPending ? (
                  <LoaderIcon className="size-4 animate-spin" />
                ) : (
                  t("Delete")
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
