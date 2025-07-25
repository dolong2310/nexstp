import { fileToBase64 } from "@/lib/utils";
import { PreviewImageType } from "@/modules/conversations/types";
import { Media } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from "../constants";

interface UseUploadMediaProps {
  maxFileSize?: number;
  allowedTypes?: string[];
  onUploadSuccess?: (mediaUrl: string, mediaData: Media) => void;
  onUploadError?: (error: string) => void;
  uploadMode?: "manual" | "preview-confirm" | "auto";
}

interface UseUploadMediaReturn {
  // States
  previewImage: PreviewImageType;
  isPreviewOpen: boolean;
  isUploading: boolean;

  // File input ref
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Actions
  handleFileChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  handleUpload: () => Promise<Media | undefined>; // Manual upload function
  handleSendImage: () => Promise<void>; // For preview-confirm mode
  handleCancelPreview: () => void;
  openFileDialog: () => void;
  resetUpload: () => void;

  // Upload mutation
  uploadMedia: any;
}

const useUploadMedia = ({
  maxFileSize = MAX_FILE_SIZE,
  allowedTypes = ["image/*"],
  onUploadSuccess,
  onUploadError,
  uploadMode = "manual",
}: UseUploadMediaProps = {}): UseUploadMediaReturn => {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewImage, setPreviewImage] = useState<PreviewImageType>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const uploadMedia = useMutation(
    trpc.conversations.uploadMedia.mutationOptions({
      onSuccess: (data) => {
        const mediaUrl = process.env.NEXT_PUBLIC_APP_URL! + data?.url;
        onUploadSuccess?.(mediaUrl, data);

        if (uploadMode === "auto") {
          // Clean up if auto upload
          handleCancelPreview();
        }
      },
      onError: (error) => {
        const errorMessage = "Failed to upload media";
        toast.error(errorMessage);
        onUploadError?.(errorMessage);
      },
    })
  );

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      const isValidType = allowedTypes.some((type) => {
        if (type.endsWith("/*")) {
          const baseType = type.split("/")[0];
          return file.type.startsWith(baseType + "/");
        }
        return file.type === type;
      });

      if (!isValidType) {
        const acceptedTypes = allowedTypes.join(", ");
        toast.error(`Please select a valid file type: ${acceptedTypes}`);
        return false;
      }

      // Check file size
      if (file.size > maxFileSize) {
        const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
        toast.error(`File size must be less than ${maxSizeMB}MB`);
        return false;
      }

      return true;
    },
    [allowedTypes, maxFileSize]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!validateFile(file)) {
        // Reset file input if validation fails
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setPreviewImage({
        url: previewUrl,
        file,
      });

      // Handle different upload modes
      switch (uploadMode) {
        case "auto":
          // Auto upload immediately (old behavior)
          try {
            const base64 = await fileToBase64(file);
            uploadMedia.mutate({
              fileName: file.name,
              fileData: base64,
              mimeType: file.type,
            });
          } catch (error) {
            toast.error("Failed to process file");
            handleCancelPreview();
          }
          break;

        case "preview-confirm":
          // Show preview modal for confirmation (ConversationForm)
          setIsPreviewOpen(true);
          break;

        case "manual":
        default:
          // Just set preview, no upload (ProfileModal)
          // Upload will happen when handleUpload is called
          break;
      }
    },
    [validateFile, uploadMode, uploadMedia]
  );

  const handleUpload = useCallback(async () => {
    if (!previewImage?.file) return;

    try {
      const base64 = await fileToBase64(previewImage.file);
      return uploadMedia.mutateAsync({
        fileName: previewImage.file.name,
        fileData: base64,
        mimeType: previewImage.file.type,
      });
    } catch (error) {
      toast.error("Failed to process file");
      throw error;
    }
  }, [previewImage, uploadMedia]);

  const handleSendImage = useCallback(async () => {
    if (!previewImage?.file) return;

    try {
      const base64 = await fileToBase64(previewImage.file);
      uploadMedia.mutate({
        fileName: previewImage.file.name,
        fileData: base64,
        mimeType: previewImage.file.type,
      });
    } catch (error) {
      toast.error("Failed to process file");
    }
  }, [previewImage, uploadMedia]);

  const handleCancelPreview = useCallback(() => {
    if (previewImage?.url) {
      URL.revokeObjectURL(previewImage.url);
    }
    setPreviewImage(null);
    setIsPreviewOpen(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewImage]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const resetUpload = useCallback(() => {
    handleCancelPreview();
    uploadMedia.reset();
  }, [handleCancelPreview, uploadMedia]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (previewImage?.url) {
        URL.revokeObjectURL(previewImage.url);
      }
    };
  }, []);

  return {
    // States
    previewImage,
    isPreviewOpen,
    isUploading: uploadMedia.isPending,

    // File input ref
    fileInputRef,

    // Actions
    handleFileChange,
    handleUpload,
    handleSendImage,
    handleCancelPreview,
    openFileDialog,
    resetUpload,

    // Upload mutation
    uploadMedia,
  };
};

export default useUploadMedia;
