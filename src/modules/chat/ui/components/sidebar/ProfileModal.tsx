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
import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import CustomAvatar from "../CustomAvatar";
import InputForm from "../InputForm";

type Props = {
  currentUser: ChatUser;
};

const ProfileModal = ({ currentUser }: Props) => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name || "",
      image: currentUser?.image || "",
    },
  });

  const image = watch("image");

  const handleUpload = (result: any) => {
    setValue("image", result?.info?.secure_url, {
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post("/api/profile", data)
      .then(() => {
        router.refresh();
        setIsOpen(false);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        toast.error("Something went wrong!");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <nav className="mt-4 flex flex-col justify-between items-center">
      <div
        className="cursor-pointer hover:opacity-75 transition"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => (document.body.style.pointerEvents = ""), 0);
        }}
      >
        <CustomAvatar user={currentUser} isOnline />
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Edit your public information
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
                <div>
                  <label
                    htmlFor=""
                    className="block text-sm font-medium leading-6"
                  >
                    Photo
                  </label>
                  <div className="mt-2 flex items-center gap-x-3">
                    <CldUploadButton
                      className="relative group cursor-pointer"
                      options={{ maxFiles: 1 }}
                      uploadPreset="messenger"
                      onSuccess={handleUpload}
                    >
                      <Image
                        src={
                          image ||
                          currentUser?.image ||
                          "/images/default-avatar.png"
                        }
                        alt="Avatar"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-white z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        Edit
                      </span>
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                    </CldUploadButton>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <DialogFooter className="mt-6 border-t border-gray-200 pt-6">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="default" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default ProfileModal;
