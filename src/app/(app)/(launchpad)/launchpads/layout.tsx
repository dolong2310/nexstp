import Navbar from "@/modules/home/ui/components/navbar";
import Footer from "@/modules/home/ui/components/footer";

import { Metadata } from "next";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    template: "%s | Store",
    default: "Store",
  },
  description: "Explore our exclusive early access deals and new products",
};

const LaunchpadsLayout = async ({ children }: Props) => {
  return (
    <div className="min-h-screen flex flex-col bg-third">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-screen-xl mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default LaunchpadsLayout;
