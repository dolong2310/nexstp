import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatUser } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import InputForm from "./InputForm";
import SelectForm from "./SelectForm";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: ChatUser[];
};

const GroupChatModal = ({ isOpen, onOpenChange, users }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      members: [],
    },
    mode: "onChange",
  });

  const members = watch("members");

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post("/api/conversations", {
        ...data,
        isGroup: true,
      })
      .then(() => {
        router.refresh();
        onOpenChange(false);
      })
      .catch((error) => {
        toast.error("Something went wrong!");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create a group chat</DialogTitle>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Create a chat with more than 2 people.
              </p>

              <div className="flex flex-col mt-8 gap-y-8">
                <InputForm
                  id="name"
                  label="Name"
                  register={register}
                  // required
                  errors={errors}
                  disabled={isLoading}
                />

                <SelectForm
                  label="Members"
                  options={users.map((user) => ({
                    label: user.name || "",
                    value: user.id,
                  }))}
                  onChange={(value) => {
                    console.log("value: ", value);
                    setValue("members", value, {
                      shouldValidate: true,
                    });
                  }}
                  value={members}
                  // register={register}
                  disabled={isLoading}
                />
              </div>
            </DialogHeader>

            <DialogFooter className="mt-6 border-t border-gray-200 pt-6">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="default" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupChatModal;
