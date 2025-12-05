import Image from "next/image";
import AboutDescription from "./_description";
import UserGuide from "./_user-guide";

const LIST_PACKAGE = [
  {
    icon: "/icons/tRPC.svg",
    name: "@trpc/client",
    version: "11.0.3",
  },
  {
    icon: "/icons/payload.svg",
    name: "payloadcms",
    version: "3.49.1",
  },
  {
    icon: "/icons/next.svg",
    name: "next",
    version: "15.2.4",
  },
  {
    icon: "/icons/react.svg",
    name: "react",
    version: "^19.0.0",
  },
  {
    icon: "/icons/tailwindcss.svg",
    name: "tailwindcss",
    version: "^4",
  },
  {
    icon: "/icons/react-query.svg",
    name: "react-query",
    version: "5.84.2",
  },
  {
    icon: "/icons/react-query.svg",
    name: "react-virtual",
    version: "^3.13.12",
  },
  {
    icon: "/icons/zod.svg",
    name: "zod",
    version: "^4.0.5",
  },
  {
    icon: "/icons/shadcn.svg",
    name: "shadcn/ui",
    version: "^1.1.6",
  },
  {
    icon: "/icons/react-hook-form.svg",
    name: "react-hook-form",
    version: "7.53.1",
  },
  {
    icon: "/icons/stripe.svg",
    name: "stripe",
    version: "^18.0.0",
  },
  {
    icon: "/icons/pusher.svg",
    name: "pusher",
    version: "^5.2.0",
  },
  {
    icon: "/icons/mongodb.svg",
    name: "mongodb",
    version: "3.49.1",
  },
  {
    icon: "/icons/zustand.svg",
    name: "zustand",
    version: "^5.0.3",
  },
  {
    icon: "/icons/date-fns.svg",
    name: "date-fns",
    version: "^4.1.0",
  },
  {
    icon: "/icons/nuqs.svg",
    name: "nuqs",
    version: "^2.4.1",
  },
  {
    icon: "/icons/typescript.svg",
    name: "typescript",
    version: "^5",
  },
];

const AboutPage = () => {
  return (
    <div className="max-w-screen-xl mx-auto h-full w-full px-4 lg:px-12 py-8">
      <div className="flex flex-wrap gap-8">
        {/* Left column */}
        <div className="w-full md:w-[calc(50%-1rem)]">
          <div className="sticky top-4 left-0">
            <Image
              className="size-50 rounded-full border-4 object-cover"
              src="/me.jpg"
              alt="profile picture"
              width={200}
              height={200}
            />

            <div className="mt-8">
              <h2 className="font-heading text-3xl sm:text-[44px]">
                <span className="line-through">John Doe</span> Long Doo
              </h2>
              <AboutDescription />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full md:w-[calc(50%-1rem)]">
          <h2 className="font-heading text-3xl sm:text-[44px]">User Guide</h2>
          <UserGuide />

          <h2 className="font-heading text-3xl sm:text-[44px] mt-8">
            Packages Used
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8 w-full mt-6">
            {LIST_PACKAGE.map((p, index) => (
              <div
                key={index}
                className="p-5 border-2 shadow-shadow rounded-base bg-main text-main-foreground transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
              >
                <img className="size-8 sm:size-10" src={p.icon} alt={p.name} />
                <p className="font-heading mt-3 text-md sm:text-xl">{p.name}</p>
                <p className="font-base mt-1 text-sm sm:text-base">
                  {p.version}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
