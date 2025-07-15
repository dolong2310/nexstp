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
    // TODO: Ensure cross-domain cookie sharing
    // sameSite: "none",
    // domain: "",
    // nexstp.com -> initial cookie
    // longdoo.nexstp.com -> cookie does not exist here
  });
};
