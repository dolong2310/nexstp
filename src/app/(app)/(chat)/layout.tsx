import StatusProvider from "@/modules/chat/ui/components/providers/StatusProvider";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: Props) => {
  return <StatusProvider>{children}</StatusProvider>;
};

export default RootLayout;
