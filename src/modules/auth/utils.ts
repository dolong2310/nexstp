import { IS_PRODUCTION } from "@/constants";
import { cookies as getCookies } from "next/headers";

export const generateAuthCookie = async ({
  prefix,
  value,
}: {
  prefix: string;
  value: string;
}) => {
  const cookies = await getCookies();

  cookies.set({
    name: `${prefix}-token`, // "payload-token" by default
    value,
    httpOnly: true,
    path: "/",
    ...(IS_PRODUCTION && {
      sameSite: "none",
      domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
      secure: true,
    }),
  });
};
