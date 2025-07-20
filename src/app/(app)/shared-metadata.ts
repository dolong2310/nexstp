export const metadataOpenGraphDefaultImage = {
  url: `${process.env.NEXT_PUBLIC_APP_URL}/auth-bg.jpg`,
  width: 1200,
  height: 630,
};

export const metadataOpenGraph = {
  url: process.env.NEXT_PUBLIC_APP_URL!,
  locale: "vi_VN",
  type: "website",
} as const;

export const metadataKeywords = {
  keywords: [
    "ecommerce",
    "marketplace",
    "online store",
    "products",
    "shopping",
    "deals",
    "multi-tenant",
  ],
};

export const metadataRobots = {
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
} as const;
