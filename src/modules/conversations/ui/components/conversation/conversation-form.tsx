"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MAX_FILE_SIZE } from "@/modules/conversations/constants";
import useConversation from "@/modules/conversations/hooks/use-conversation";
import useSession from "@/modules/conversations/hooks/use-session";
import useUploadMedia from "@/modules/conversations/hooks/use-upload-media";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, SendIcon, UploadIcon } from "lucide-react";
import React, { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import PreviewImageModal from "../modals/preview-image-modal";

const messageSchema = z.object({
  conversationId: z.string(),
  message: z.string().optional(),
  image: z.string().optional(),
});

const ConversationForm = () => {
  const typingRef = useRef(false);
  const trpc = useTRPC();
  const { session } = useSession();
  const { conversationId } = useConversation();

  const form = useForm<z.infer<typeof messageSchema>>({
    defaultValues: {
      message: "",
    },
  });

  const sendMessage = useMutation(trpc.conversations.sendMessage.mutationOptions({}));
  const sendTyping = useMutation(trpc.conversations.sendTyping.mutationOptions({}));
  const stopTyping = useMutation(trpc.conversations.stopTyping.mutationOptions({}));

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
        id: session?.user?.id || "",
        name: session?.user?.username || "",
        email: session?.user?.email || "",
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

  const onSubmit: SubmitHandler<z.infer<typeof messageSchema>> = (data) => {
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
      <div className="p-4 bg-background border-t flex items-center gap-2 lg:gap-4 w-full">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="elevated"
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
            className="flex items-center gap-2 lg:gap-4 w-full"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Write a message"
                      value={field.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        handleTyping(value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="elevated">
              Send <SendIcon size={18} />
            </Button>
          </form>
        </Form>
      </div>

      <PreviewImageModal
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
