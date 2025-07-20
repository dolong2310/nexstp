import SignUpView from "@/modules/auth/ui/views/sign-up-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

const SignUpPage = () => {
  return <SignUpView />;
};

export default SignUpPage;
