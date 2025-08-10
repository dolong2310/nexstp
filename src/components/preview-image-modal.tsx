import Media from "@/components/media";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Props {
  src: string;
  alt?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PreviewImageModal = ({
  src,
  alt = "Preview Image",
  isOpen,
  onOpenChange,
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent isFullScreen>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <Media
          src={src}
          alt={alt}
          fill
          containerClassName="aspect-auto size-full place-self-center"
          className="size-auto rounded-base object-contain"
          showLoading
          showError
        />
      </DialogContent>
    </Dialog>
  );
};

export default PreviewImageModal;
