import React from "react";

const LoadingModal = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-sky-500" />
    </div>
  );
};

export default LoadingModal;
