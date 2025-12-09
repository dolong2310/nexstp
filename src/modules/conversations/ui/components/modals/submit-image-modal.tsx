import Media from "@/components/media";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderIcon, SendIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { KeyboardEvent } from "react";

interface Props {
  open: boolean;
  src?: string;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  handleSendImage: () => void;
  handleCancelPreview: () => void;
}

const SubmitImageModal = ({
  open,
  src,
  isLoading,
  onOpenChange,
  handleSendImage,
  handleCancelPreview,
}: Props) => {
  const t = useTranslations();
  const handlePressEnter = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter") {
      handleSendImage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent noCloseButton className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Send Image")}</DialogTitle>
        </DialogHeader>

        {src && (
          <Media
            src={src}
            alt={t("Preview")}
            width={400}
            height={300}
            isBordered
            shadow
            containerClassName="w-full max-w-[50vh] max-h-[90vh] overflow-hidden rounded-lg bg-muted"
            className="w-full h-auto object-contain"
          />
        )}

        <DialogFooter className="flex gap-2">
          <DialogClose asChild>
            <Button
              variant="neutral"
              onClick={handleCancelPreview}
              disabled={isLoading}
            >
              {t("Cancel")}
            </Button>
          </DialogClose>

          <Button
            autoFocus
            variant="default"
            disabled={isLoading}
            onKeyDown={handlePressEnter}
            onClick={handleSendImage}
          >
            {isLoading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <>
                {t("Send")} <SendIcon size={18} />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitImageModal;
