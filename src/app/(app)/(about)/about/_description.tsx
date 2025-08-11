"use client";

import { useState } from "react";

const languages = [
  {
    code: "en",
    label: "English",
    description: `"Meet Nexstp - a Next.js project where the developer basically said 'Why use 5 packages when you can use 50?' We've got PayloadCMS for content management, tRPC because 'any' types are the enemy, Pusher for real-time chat (because vanilla WebSockets are for masochists), Stripe for the money (priorities!), Zustand for state management (Redux gave us PTSD), and a whole arsenal of Radix UI components. Looking at the package list, this is clearly the work of a frontend developer who's been around the block - complete with launchpad crowdfunding, multi-tenant system, real-time chat with data chunking (because we're paranoid about Pusher limits), and probably a coffee addiction. It's the perfect embodiment of 'Why keep it simple when you can make it enterprise-grade?' 😂"`,
  },
  {
    code: "vi",
    label: "Vietnamese",
    description: `"Đây là Nexstp - một dự án Next.js mà developer đã dùng mọi thứ từ A đến Z: PayloadCMS để làm CMS, tRPC để type-safe API (vì ai mà chịu được any type), Pusher để real-time chat (vì WebSocket thuần quá khổ), Stripe để nhận tiền (quan trọng nhất), Zustand để quản lý state (Redux quá rườm rà), và cả một rổ Radix UI components. Nhìn vào LIST_PACKAGE thì biết ngay đây là công trình của một frontend developer đã "ăn đủ muối" - từ launchpad để crowdfunding, tenant system để multi-store, đến cả chat real-time với chunking data vì sợ Pusher giới hạn payload. Điển hình của câu "tại sao làm đơn giản khi mình có thể làm phức tạp?" 😂"`,
  },
];

const AboutDescription = () => {
  const [language, setLanguage] = useState(languages[0]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev?.code === "en" ? languages[1] : languages[0]));
  };

  return (
    <p className="font-base mt-6 text-base sm:text-xl">
      {language?.description}
      <span
        className="inline-block ml-2 font-bold cursor-pointer"
        onClick={handleToggleLanguage}
      >
        ...{language?.code === "vi" ? "English" : "Vietnamese"}
      </span>
    </p>
  );
};

export default AboutDescription;
