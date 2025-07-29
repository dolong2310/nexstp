import { LoaderIcon } from "lucide-react";

const LoadingFullPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <LoaderIcon className="size-8 animate-spin text-white" />
    </div>
  );
};

export default LoadingFullPage;
