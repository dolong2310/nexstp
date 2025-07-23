"use client";

import axios from "axios";
import { CldUploadButton } from "next-cloudinary";
import React, { useRef } from "react";
import {
  FieldErrors,
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormRegister,
} from "react-hook-form";
// import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";
import useConversation from "@/modules/chat/hooks/use-conversation";
import { SendIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ConversationForm = () => {
  const typingRef = useRef(false);

  // const session = useSession();
  const { conversationId } = useConversation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });

  const handleTriggerTyping = (isTyping: boolean) => {
    typingRef.current = isTyping;
    const endpoint = `/api/pusher/${isTyping ? "typing" : "stop_typing"}`;
    // axios.post(endpoint, { conversationId, user: session.data?.user });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue("message", "", { shouldValidate: true });

    if (typingRef.current) {
      typingRef.current = false;
      handleTriggerTyping(false);
    }

    axios.post("/api/messages", {
      ...data,
      conversationId,
    });
  };

  const handleUpload = (result: any) => {
    axios.post("/api/messages", {
      image: result?.info?.secure_url,
      conversationId,
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isTyping = Boolean(value);

    if (isTyping !== typingRef.current) {
      typingRef.current = isTyping;
      handleTriggerTyping(isTyping);
    }
  };

  return (
    <div className="p-4 bg-background border-t flex items-center gap-2 lg:gap-4 w-full">
      <CldUploadButton
        options={{ maxFiles: 1 }}
        uploadPreset="messenger"
        onSuccess={handleUpload}
      >
        <UploadIcon size={30} className="text-sky-500" />
      </CldUploadButton>
      <form
        className="flex items-center gap-2 lg:gap-4 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <MessageInput
          id="message"
          register={register}
          errors={errors}
          required
          placeholder="Write a message"
          onChange={handleTyping}
        />

        <Button
          type="submit"
          className="rounded-full p-2 bg-sky-500 cursor-pointer hover:bg-sky-600 transition"
        >
          <SendIcon size={18} className="text-white" />
        </Button>
      </form>
    </div>
  );
};

type MessageInputProps = {
  id: string;
  type?: string;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  required?: boolean;
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const MessageInput = ({
  id,
  type = "text",
  register,
  errors,
  required,
  placeholder,
  onChange,
}: MessageInputProps) => {
  return (
    <Input
      id={id}
      type={type}
      autoComplete={id}
      className="text-foreground font-light py-2 px-4 bg-neutral-100 w-full rounded-full focus:outline-none"
      placeholder={placeholder}
      {...register(id, { required, onChange: (e) => onChange?.(e) })}
    />
  );
};

export default ConversationForm;
