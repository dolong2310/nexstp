import SignInView from "@/modules/auth/ui/views/sign-in-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

const SignInPage = async () => {
  return <SignInView />;
};

export default SignInPage;
