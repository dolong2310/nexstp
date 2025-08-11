import Footer from "@/modules/home/ui/components/footer";
import Navbar from "@/modules/home/ui/components/navbar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const AboutLayout = async ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-secondary-background border-t-4 bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px]">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default AboutLayout;
