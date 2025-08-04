"use client";

import type { BeforeDocumentControlsClientProps } from "payload";
import { LaunchpadActions } from "./launchpads/launchpad-actions";

export const CustomSaveButton = (props: BeforeDocumentControlsClientProps) => {
  return (
    <div className="">
      <LaunchpadActions />
    </div>
  );
};
