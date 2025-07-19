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
    sameSite: "none",
    domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    secure: process.env.NODE_ENV === "production",
    // nexstp.com -> initial cookie
    // longdoo.nexstp.com -> cookie does not exist here
  });
};
