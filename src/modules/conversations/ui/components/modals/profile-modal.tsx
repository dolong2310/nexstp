import Media from "@/components/media";
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
import { getCurrentImageUrl } from "@/lib/utils";
import { MAX_FILE_SIZE } from "@/modules/conversations/constants";
import useUploadMedia from "@/modules/conversations/hooks/use-upload-media";
import { ChatUser, Media as MediaType } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  currentUser: ChatUser;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const profileSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(), // ID của media document
});

const ProfileModal = ({ currentUser, isOpen, onOpenChange }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      image: typeof currentUser?.image === "string" ? currentUser.image : "",
    },
    mode: "onChange",
  });

  const updateProfile = useMutation(
    trpc.conversations.updateProfile.mutationOptions({
      onSuccess: () => {
        router.refresh();
        toast.success("Profile updated successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong!");
      },
    })
  );

  const uploadMediaHook = useUploadMedia({
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ["image/*"],
    uploadMode: "manual",
    onUploadError: (error) => {
      toast.error(error || "Failed to upload avatar");
    },
  });

  const avatar = useMemo(() => {
    if (uploadMediaHook.previewImage?.url) {
      return uploadMediaHook.previewImage.url;
    }
    return getCurrentImageUrl(currentUser?.image as string | MediaType);
  }, [uploadMediaHook.previewImage?.url, currentUser?.image]);

  // const isSubmitDisabled = useMemo(() => {
  //   return (
  //     updateProfile.isPending ||
  //     uploadMediaHook.isUploading ||
  //     !form.formState.isDirty ||
  //     Object.keys(form.formState.errors).length > 0
  //   );
  // }, [
  //   updateProfile.isPending,
  //   uploadMediaHook.isUploading,
  //   form.formState.isDirty,
  //   form.formState.errors,
  // ]);

  const handleModalOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      uploadMediaHook.resetUpload();
      form.reset();
    }
  };

  const onSubmit: SubmitHandler<z.infer<typeof profileSchema>> = async (
    data
  ) => {
    try {
      let imageId;

      if (uploadMediaHook.previewImage?.file) {
        const uploadedMedia = await uploadMediaHook.handleUpload();
        imageId = uploadedMedia?.id;
        toast.success("Avatar uploaded successfully!");
      }

      await updateProfile.mutateAsync({
        name: data.name,
        image: imageId,
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // console.log({
  //   errors: Object.keys(form.formState.errors).length > 0,
  //   isDirty: form.formState.isDirty,
  //   "updateProfile.isPending": updateProfile.isPending,
  //   "uploadMediaHook.isUploading": uploadMediaHook.isUploading,
  //   formValues: form.getValues(),
  //   // RESULT: isSubmitDisabled,
  // });

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      {/* showCloseButton={false} */}
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-2xl">Profile</DialogTitle>
              <DialogDescription>
                Edit your public information
              </DialogDescription>

              <div className="flex flex-col mt-4 gap-y-6">
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel className="text-base">Avatar</FormLabel>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Media
                        src={avatar}
                        alt="Avatar"
                        width={64}
                        height={64}
                        isBordered
                        className="rounded-md object-cover"
                      />
                      {uploadMediaHook.isUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                          <LoaderIcon className="size-4 animate-spin text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="noShadowDefault"
                        size="sm"
                        onClick={uploadMediaHook.openFileDialog}
                        disabled={
                          uploadMediaHook.isUploading || updateProfile.isPending
                        }
                      >
                        <UploadIcon className="size-4" />
                        Choose Image
                      </Button>

                      <input
                        ref={uploadMediaHook.fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={uploadMediaHook.handleFileChange}
                        className="hidden"
                      />

                      <p className="text-xs text-foreground">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  </div>
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
                  updateProfile.isPending || uploadMediaHook.isUploading
                }
              >
                {updateProfile.isPending || uploadMediaHook.isUploading ? (
                  <LoaderIcon className="size-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
