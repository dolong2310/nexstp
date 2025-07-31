import Link from "next/link";
import React from "react";

const ConversationNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 border-b font-medium bg-background z-20">
      <div className="px-4 lg:px-12 flex items-center justify-between h-full">
        <Link href="/" className="flex items-center gap-2">
          <p className="text-xl">Conversations</p>
        </Link>

        <div />
      </div>
    </nav>
  );
};

export default ConversationNavbar;
