"use client";

import React from "react";

const UserGuide = () => {
  return (
    <div className="mt-6 space-y-6">
      <div className="relative pb-[50%] h-0 overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          width="1576"
          height="1007"
          src="https://www.youtube.com/embed/rKEnq2gv2Kc"
          title="User guide | Nexstp Part 1"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <div className="relative pb-[50%] h-0 overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          width="1576"
          height="1007"
          src="https://www.youtube.com/embed/FO7KFXJsjog"
          title="User guide | Nexstp Part 2"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default UserGuide;
