import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import Image from "next/image";

type Props = {
  src: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const ImageModal = ({ src, isOpen, onOpenChange }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex justify-center items-center">
        <DialogTitle className="sr-only"></DialogTitle>
        <div style={{ maxWidth: "50vw", width: "100%" }}>
          <Image
            src={src}
            alt="Preview Image"
            width={0}
            height={0}
            sizes="50vw"
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
