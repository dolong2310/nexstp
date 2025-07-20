import LogoutButton from "@/components/logout-button";
import ThemeButton from "@/components/theme-button";
import React from "react";

const Footer = () => {
  return (
    <footer className="flex border-t justify-between font-medium p-6">
      <div className="flex items-center gap-2">
        <p>nexstp, Inc.</p>
      </div>

      <div className="flex items-center gap-4">
        <ThemeButton />
        <LogoutButton />
      </div>
    </footer>
  );
};

export default Footer;
