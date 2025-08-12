import { IS_PRODUCTION } from "@/constants";
import { cookies as getCookies } from "next/headers";

interface CookieOptions {
  name: string;
  value?: string;
  httpOnly?: boolean;
  path?: string;
  sameSite?: "strict" | "lax" | "none";
  domain?: string;
  secure?: boolean;
  maxAge?: number;
}

export const setAuthCookie = async (name: string, value: string) => {
  const cookies = await getCookies();

  if (IS_PRODUCTION) {
    cookies.set({
      name,
      value,
      httpOnly: true,
      path: "/",
      sameSite: "none",
      domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
      secure: true,
    });
  } else {
    cookies.set({
      name,
      value,
      httpOnly: true,
      path: "/",
    });
  }
};

export const deleteAuthCookie = async (name: string) => {
  const cookies = await getCookies();

  if (IS_PRODUCTION) {
    // Trong production, phải set cookie với cùng domain/sameSite để xóa được
    cookies.set({
      name,
      value: "",
      httpOnly: true,
      path: "/",
      sameSite: "none",
      domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
      secure: true,
      maxAge: 0, // Expire immediately
    });
  } else {
    cookies.delete(name);
  }
};
