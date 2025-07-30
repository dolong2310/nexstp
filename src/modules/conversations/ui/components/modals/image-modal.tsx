import Media from "@/components/media";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Props {
  src: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alt?: string;
};

const ImageModal = ({
  src,
  isOpen,
  onOpenChange,
  alt = "Preview Image",
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col justify-center items-center max-w-4xl max-h-[90vh]">
        <DialogTitle className="sr-only">{alt}</DialogTitle>

        <div className="mt-12">
          <Media
            src={src}
            alt={alt}
            width={800}
            height={600}
            sizes="(max-width: 768px) 95vw, 80vw"
            containerClassName="w-full min-h-[300px] flex items-center justify-center aspect-auto"
            className="w-auto h-auto max-w-full max-h-[80vh] rounded-lg object-contain"
            errorClassName="min-h-[300px]"
            showLoading
            showError
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
