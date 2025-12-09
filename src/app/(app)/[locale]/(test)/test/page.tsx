import { getTranslations } from "next-intl/server";
import ClientComponent from "./ClientComponent";
import { Metadata } from "next";
import { Locale } from "next-intl";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale: locale as Locale,
  });

  return {
    title: t("test"),
    description: t("test"),
  };
}

export default function TestPage() {
  return <ClientComponent />;
}
