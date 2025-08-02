"use client";

import { LaunchpadActions } from "@/modules/launchpads/ui/launchpad-actions";
import type { BeforeDocumentControlsClientProps } from "payload";

export const CustomSaveButton = (props: BeforeDocumentControlsClientProps) => {
  return (
    <div className="">
      <LaunchpadActions />
    </div>
  );
};
