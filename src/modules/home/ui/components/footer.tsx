import ThemeButton from "@/components/theme-button";
import React from "react";

const Footer = () => {
  return (
    <footer className="flex border-t justify-between font-medium p-6">
      <div className="flex items-center gap-2">
        <p>nexstp, Inc.</p>
      </div>

      <ThemeButton />
    </footer>
  );
};

export default Footer;
