import SignUpView from "@/modules/auth/ui/views/sign-up-view";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale: locale as Locale,
  });

  return {
    title: t("Sign Up"),
  };
}

const SignUpPage = () => {
  return <SignUpView />;
};

export default SignUpPage;
