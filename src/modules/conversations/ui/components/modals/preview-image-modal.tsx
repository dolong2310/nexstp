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
import { KeyboardEvent } from "react";

interface Props {
  open: boolean;
  src?: string;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  handleSendImage: () => void;
  handleCancelPreview: () => void;
}

const PreviewImageModal = ({
  open,
  src,
  isLoading,
  onOpenChange,
  handleSendImage,
  handleCancelPreview,
}: Props) => {
  const handlePressEnter = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter") {
      handleSendImage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Send Image</DialogTitle>
        </DialogHeader>

        {src && (
          <Media
            src={src}
            alt="Preview"
            width={400}
            height={300}
            containerClassName="w-full max-w-[50vh] max-h-[90vh] overflow-hidden rounded-lg bg-muted"
            className="w-full h-auto object-contain"
          />
        )}

        <DialogFooter className="flex gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={handleCancelPreview}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            autoFocus
            variant="elevated"
            disabled={isLoading}
            onKeyDown={handlePressEnter}
            onClick={handleSendImage}
          >
            {isLoading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <>
                Send <SendIcon size={18} />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewImageModal;
