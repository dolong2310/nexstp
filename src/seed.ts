import { getPayload } from "payload";
import config from "@payload-config";
import { stripe } from "./lib/stripe";
import { Product } from "./payload-types";

type ProductsType = Omit<Product, "createdAt" | "id" | "sizes" | "updatedAt"> &
  Partial<Pick<Product, "createdAt" | "id" | "updatedAt">>;

const mockCategories = [
  {
    name: "All",
    slug: "all",
  },
  {
    name: "Business & Money",
    color: {
      light: "#FFB347",
      dark: "#CC5500",
    },
    slug: "business-money",
    subcategories: [
      { name: "Accounting", slug: "accounting" },
      {
        name: "Entrepreneurship",
        slug: "entrepreneurship",
      },
      { name: "Gigs & Side Projects", slug: "gigs-side-projects" },
      { name: "Investing", slug: "investing" },
      { name: "Management & Leadership", slug: "management-leadership" },
      {
        name: "Marketing & Sales",
        slug: "marketing-sales",
      },
      { name: "Networking, Careers & Jobs", slug: "networking-careers-jobs" },
      { name: "Personal Finance", slug: "personal-finance" },
      { name: "Real Estate", slug: "real-estate" },
    ],
  },
  {
    name: "Design",
    color: {
      light: "#B5B9FF",
      dark: "#4B0082",
    },
    slug: "design",
    subcategories: [
      { name: "UI/UX", slug: "ui-ux" },
      { name: "Graphic Design", slug: "graphic-design" },
      { name: "3D Modeling", slug: "3d-modeling" },
      { name: "Typography", slug: "typography" },
    ],
  },
  {
    name: "Drawing & Painting",
    color: {
      light: "#FFCAB0",
      dark: "#D2691E",
    },
    slug: "drawing-painting",
    subcategories: [
      { name: "Watercolor", slug: "watercolor" },
      { name: "Acrylic", slug: "acrylic" },
      { name: "Oil", slug: "oil" },
      { name: "Pastel", slug: "pastel" },
      { name: "Charcoal", slug: "charcoal" },
    ],
  },
  {
    name: "Software Development",
    color: {
      light: "#7EC8E3",
      dark: "#2E86AB",
    },
    slug: "software-development",
    subcategories: [
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile Development", slug: "mobile-development" },
      { name: "Game Development", slug: "game-development" },
      { name: "Programming Languages", slug: "programming-languages" },
      { name: "DevOps", slug: "devops" },
    ],
  },
  {
    name: "Writing & Publishing",
    color: {
      light: "#D8B5FF",
      dark: "#8B5A96",
    },
    slug: "writing-publishing",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Blogging", slug: "blogging" },
      { name: "Copywriting", slug: "copywriting" },
      { name: "Self-Publishing", slug: "self-publishing" },
    ],
  },
  {
    name: "Other",
    slug: "other",
  },
  {
    name: "Education",
    color: {
      light: "#FFE066",
      dark: "#B8860B",
    },
    slug: "education",
    subcategories: [
      { name: "Online Courses", slug: "online-courses" },
      { name: "Tutoring", slug: "tutoring" },
      { name: "Test Preparation", slug: "test-preparation" },
      { name: "Language Learning", slug: "language-learning" },
    ],
  },
  {
    name: "Self Improvement",
    color: {
      light: "#96E6B3",
      dark: "#228B22",
    },
    slug: "self-improvement",
    subcategories: [
      { name: "Productivity", slug: "productivity" },
      { name: "Personal Development", slug: "personal-development" },
      { name: "Mindfulness", slug: "mindfulness" },
      { name: "Career Growth", slug: "career-growth" },
    ],
  },
  {
    name: "Fitness & Health",
    color: {
      light: "#FF9AA2",
      dark: "#CD5C5C",
    },
    slug: "fitness-health",
    subcategories: [
      { name: "Workout Plans", slug: "workout-plans" },
      { name: "Nutrition", slug: "nutrition" },
      { name: "Mental Health", slug: "mental-health" },
      { name: "Yoga", slug: "yoga" },
    ],
  },
  {
    name: "Music",
    color: {
      light: "#FFD700",
      dark: "#B8860B",
    },
    slug: "music",
    subcategories: [
      { name: "Songwriting", slug: "songwriting" },
      { name: "Music Production", slug: "music-production" },
      { name: "Music Theory", slug: "music-theory" },
      { name: "Music History", slug: "music-history" },
    ],
  },
  {
    name: "Photography",
    color: {
      light: "#FF6B6B",
      dark: "#DC143C",
    },
    slug: "photography",
    subcategories: [
      { name: "Portrait", slug: "portrait" },
      { name: "Landscape", slug: "landscape" },
      { name: "Street Photography", slug: "street-photography" },
      { name: "Nature", slug: "nature" },
      { name: "Macro", slug: "macro" },
    ],
  },
];

const categorySlugs = mockCategories.slice(1, 4).map((cat) => cat.slug);

function getRandomCategorySlug() {
  return categorySlugs[Math.floor(Math.random() * categorySlugs.length)];
}

const mockTags = [
  { name: "Popular" },
  { name: "New Arrival" },
  { name: "Discount" },
  { name: "Limited Edition" },
  { name: "Best Seller" },
  { name: "Trending" },
  { name: "Featured" },
  { name: "Exclusive" },
  { name: "Eco-Friendly" },
  { name: "Handmade" },
];

function getRandomTags(n = 2) {
  const shuffled = [...mockTags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n).map((tag) => tag.name);
}

const mockRefundPolicy: Product["refundPolicy"][] = [
  "30-day",
  "14-day",
  "7-day",
  "3-day",
  "1-day",
  "no-refunds",
];

function randomKeyRefundPolicy() {
  return mockRefundPolicy[Math.floor(Math.random() * mockRefundPolicy.length)];
}

const mockProducts: ProductsType[] = Array.from({ length: 10 }, (_, i) => ({
  name: `Product ${i + 1}`,
  price: 19.99 + i * 10,
  content: {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: `Content for product ${i + 1}`,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
          textStyle: "",
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  },
  isPrivate: false,
  isArchived: false,
  description: "Description for product " + (i + 1),
  refundPolicy: randomKeyRefundPolicy(),
  category: getRandomCategorySlug(),
  tags: getRandomTags(),
}));

const seed = async () => {
  const payload = await getPayload({
    config,
  });

  const adminAccount = await stripe.accounts.create({});

  // Create admin tenant
  const adminTenant = await payload.create({
    collection: "tenants",
    data: {
      name: "admin",
      slug: "admin",
      stripeAccountId: adminAccount.id,
    },
  });

  // Create admin user
  await payload.create({
    collection: "users",
    data: {
      username: "admin",
      email: "nexstp@gmail.com",
      password: "123123",
      roles: ["super-admin"],
      tenants: [
        {
          tenant: adminTenant.id,
        },
      ],
      _verified: true, // Đặt thành true để không cần verify email
      _verificationToken: null, // Đặt thành null để không cần verify email
    },
    disableVerificationEmail: true,
  });

  const createdCategories: Record<string, any> = {};

  // Create categories and subcategories
  for (const category of mockCategories) {
    const parentCategory = await payload.create({
      collection: "categories",
      data: {
        name: category.name,
        slug: category.slug,
        color: category.color,
        parent: null,
      },
    });
    createdCategories[category.slug] = parentCategory;

    for (const subcategory of category.subcategories || []) {
      const subCat = await payload.create({
        collection: "categories",
        data: {
          name: subcategory.name,
          slug: subcategory.slug,
          parent: parentCategory.id,
        },
      });
      createdCategories[subcategory.slug] = subCat;
    }
  }

  const createdTags: Record<string, any> = {};

  // Create tags
  for (const mockTag of mockTags) {
    const tag = await payload.create({
      collection: "tags",
      data: mockTag,
    });
    createdTags[mockTag.name] = tag.id;
  }

  // Create products
  for (const product of mockProducts) {
    const categoryObj = createdCategories[product.category as string];
    const tags = (product.tags as string[]).map((tag) => createdTags[tag]);

    await payload.create({
      collection: "products",
      data: {
        ...product,
        tags,
        category: categoryObj ? categoryObj.id : null,
        tenant: adminTenant.id,
      },
    });
  }
};

try {
  await seed();
  process.exit(0);
} catch (error) {
  console.error("Error during seeding:", error);
  process.exit(1); // Exit with error code
}
