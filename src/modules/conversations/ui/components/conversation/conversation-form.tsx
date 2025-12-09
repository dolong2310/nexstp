"use client";

import { AutosizeTextarea } from "@/components/autosize-textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import useSession from "@/hooks/use-session";
import { MAX_FILE_SIZE } from "@/modules/conversations/constants";
import useConversation from "@/modules/conversations/hooks/use-conversation";
import useUploadMedia from "@/modules/conversations/hooks/use-upload-media";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { SendIcon, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import React, { useRef } from "react";
import {
  ControllerRenderProps,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import z from "zod";

const SubmitImageModal = dynamic(() => import("../modals/submit-image-modal"), {
  ssr: false,
});

const messageSchema = z.object({
  conversationId: z.string(),
  message: z.string().optional(),
  image: z.string().optional(),
});

const ConversationForm = () => {
  const t = useTranslations();
  const typingRef = useRef(false);
  const trpc = useTRPC();
  const { user } = useSession();
  const { conversationId } = useConversation();

  const form = useForm<z.infer<typeof messageSchema>>({
    defaultValues: {
      message: "",
    },
  });

  const sendMessage = useMutation(
    trpc.conversations.sendMessage.mutationOptions({})
  );
  const sendTyping = useMutation(
    trpc.conversations.sendTyping.mutationOptions({})
  );
  const stopTyping = useMutation(
    trpc.conversations.stopTyping.mutationOptions({})
  );

  // Use upload media hook with preview-confirm mode
  const uploadMediaHook = useUploadMedia({
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ["image/*"],
    uploadMode: "preview-confirm", // Preview and confirm mode
    onUploadSuccess: async (mediaUrl) => {
      try {
        await sendMessage.mutateAsync({
          image: mediaUrl,
          conversationId,
        });
        uploadMediaHook.handleCancelPreview();
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
  });

  const handleTriggerTyping = (isTyping: boolean) => {
    typingRef.current = isTyping;
    const mutation = isTyping ? sendTyping : stopTyping;
    mutation.mutate({
      conversationId,
      user: {
        id: user?.id.toString() || "",
        name: user?.username || "",
        email: user?.email || "",
      },
    });
  };

  const handleTyping = (value: string) => {
    const isTyping = Boolean(value);
    if (isTyping !== typingRef.current) {
      typingRef.current = isTyping;
      handleTriggerTyping(isTyping);
    }
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const handleInputChange =
    (field: ControllerRenderProps<FieldValues, "message">) =>
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      handleTyping(value);
      field.onChange(value);
    };

  const onSubmit: SubmitHandler<z.infer<typeof messageSchema>> = (data) => {
    if (!data.message && !uploadMediaHook.previewImage) {
      return; // Prevent sending empty messages
    }

    form.setValue("message", "", { shouldValidate: true });

    if (typingRef.current) {
      typingRef.current = false;
      handleTriggerTyping(false);
    }

    sendMessage.mutate({
      ...data,
      conversationId,
    });
  };

  return (
    <>
      <div className="p-4 bg-secondary-background border-t-4 flex items-end gap-2 lg:gap-4 w-full">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="default"
            onClick={uploadMediaHook.openFileDialog}
          >
            <UploadIcon className="size-4" />
          </Button>
          <input
            ref={uploadMediaHook.fileInputRef}
            type="file"
            accept="image/*"
            onChange={uploadMediaHook.handleFileChange}
            className="hidden"
          />
        </div>

        <Form {...form}>
          <form
            autoComplete="off"
            className="flex items-end gap-2 lg:gap-4 w-full"
            // onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <AutosizeTextarea
                      {...field}
                      className="min-h-10 resize-none"
                      placeholder={t("Write a message")}
                      minHeight={40}
                      maxHeight={192}
                      value={field.value}
                      onKeyDown={handleKeydown}
                      onChange={handleInputChange(field)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="default"
              onClick={form.handleSubmit(onSubmit)}
            >
              {t("Send")} <SendIcon size={18} />
            </Button>
          </form>
        </Form>
      </div>

      <SubmitImageModal
        open={uploadMediaHook.isPreviewOpen}
        src={uploadMediaHook.previewImage?.url}
        isLoading={sendMessage.isPending || uploadMediaHook.isUploading}
        onOpenChange={() => uploadMediaHook.handleCancelPreview()}
        handleSendImage={uploadMediaHook.handleSendImage}
        handleCancelPreview={uploadMediaHook.handleCancelPreview}
      />
    </>
  );
};

export default ConversationForm;
