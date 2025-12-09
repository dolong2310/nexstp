import SignInView from "@/modules/auth/ui/views/sign-in-view";
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
    title: t("Sign In"),
  };
}

const SignInPage = async () => {
  return <SignInView />;
};

export default SignInPage;
