import { getPayload } from "payload";
import config from "@payload-config";
import { headers as getHeaders } from "next/headers";

export default async function getSession() {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    const session = await payload.auth({ headers });

    return session;
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}
