"use client";

import { TriangleAlertIcon } from "lucide-react";

const ErrorPage = () => {
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="flex flex-col items-center justify-center gap-y-4 w-full rounded-lg bg-background border border-black border-dashed p-8">
        <TriangleAlertIcon />
        <p className="text-base font-medium">Something went wrong</p>
      </div>
    </div>
  );
};

export default ErrorPage;
