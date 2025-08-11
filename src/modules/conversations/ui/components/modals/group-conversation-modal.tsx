import { toast } from "sonner";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChatUser } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: ChatUser[];
}

const conversationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  members: z
    .array(z.object({ value: z.string() }))
    .min(2, "At least 2 members are required"),
});

const GroupConversationModal = ({ isOpen, onOpenChange, users }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof conversationSchema>>({
    resolver: zodResolver(conversationSchema),
    defaultValues: {
      name: "",
      members: [],
    },
    mode: "onChange",
  });

  const createConversation = useMutation(
    trpc.conversations.createConversation.mutationOptions({
      onSuccess: () => {
        router.refresh();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong!");
      },
    })
  );

  const handleModalOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      form.reset();
    }
  };

  const onSubmit: SubmitHandler<z.infer<typeof conversationSchema>> = (
    data
  ) => {
    createConversation.mutate({
      ...data,
      isGroup: true,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent noCloseButton>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Create a group chat
              </DialogTitle>
              <DialogDescription>
                Create a chat with more than 2 people.
              </DialogDescription>

              <div className="flex flex-col mt-4 gap-y-6">
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-start text-base">Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel className="text-start text-base">Members</FormLabel>
                  <MultiSelect
                    // defaultValue={["", ""]}
                    placeholder=""
                    maxCount={3}
                    disabled={createConversation.isPending}
                    options={users.map((user) => ({
                      label: user.name || "",
                      value: user.id,
                    }))}
                    onValueChange={(value) => {
                      console.log("value: ", value);
                      form.setValue(
                        "members",
                        value.map((v) => ({ value: v })),
                        {
                          shouldValidate: true,
                        }
                      );
                    }}
                  />
                </FormItem>
              </div>
            </DialogHeader>

            <DialogFooter className="mt-8">
              <DialogClose asChild>
                <Button variant="neutral">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                variant="default"
                className="bg-main"
                disabled={
                  createConversation.isPending ||
                  !form.formState.isValid ||
                  !form.formState.isDirty
                }
              >
                {createConversation.isPending ? (
                  <LoaderIcon className="size-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupConversationModal;
