import { getPayload } from "payload";
import config from "@/payload.config";
import path from "path";
import fs from "fs";

const seedMediaAndBanners = async () => {
  const payload = await getPayload({ config });

  // Tạo media từ files có sẵn trong thư mục media
  const mediaDir = path.join(process.cwd(), "media");
  const mediaFiles = fs
    .readdirSync(mediaDir)
    .filter(
      (file) =>
        file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".jpeg")
    );

  const createdMedia = [];

  // Upload một số media files làm banner images
  for (let i = 0; i < Math.min(3, mediaFiles.length); i++) {
    const fileName = mediaFiles[i];
    if (!fileName) continue;
    const filePath = path.join(mediaDir, fileName);

    try {
      const fileBuffer = fs.readFileSync(filePath);

      const media = await payload.create({
        collection: "media",
        data: {
          alt: `Banner image ${i + 1}`,
        },
        filePath,
      });

      createdMedia.push(media);
      console.log(`Created media: ${fileName}`);
    } catch (error) {
      console.error(`Error creating media ${fileName}:`, error);
    }
  }

  if (createdMedia.length === 0) {
    console.log("No media created, skipping banner seeding");
    return;
  }

  // Lấy tenants
  const tenants = await payload.find({
    collection: "tenants",
    limit: 3,
  });

  if (tenants.docs.length === 0) {
    console.log("No tenants found, skipping banner seeding");
    return;
  }

  const bannerData = [
    {
      title: "Summer Sale - Up to 50% Off",
      description: "Don't miss our biggest sale of the year!",
      tenant: tenants.docs[0]?.id,
      priority: 10,
      isActive: true,
      image: createdMedia[0]?.id,
    },
    {
      title: "New Collection Launch",
      description: "Discover our latest products",
      tenant: tenants.docs[1]?.id || tenants.docs[0]?.id,
      priority: 8,
      isActive: true,
      image: createdMedia[1]?.id || createdMedia[0]?.id,
    },
    {
      title: "Limited Time Offer",
      description: "Exclusive deals for VIP customers",
      tenant: tenants.docs[2]?.id || tenants.docs[0]?.id,
      priority: 6,
      isActive: true,
      image: createdMedia[2]?.id || createdMedia[0]?.id,
    },
  ];

  // Tạo banners
  for (const banner of bannerData) {
    if (!banner.tenant || !banner.image) {
      console.error(`Skipping banner ${banner.title}: missing tenant or image`);
      continue;
    }

    try {
      await payload.create({
        collection: "banners",
        data: {
          title: banner.title,
          description: banner.description,
          tenant: banner.tenant,
          priority: banner.priority,
          isActive: banner.isActive,
          image: banner.image,
        },
      });
      console.log(`Created banner: ${banner.title}`);
    } catch (error) {
      console.error(`Error creating banner ${banner.title}:`, error);
    }
  }
};

// Uncomment to run: node -r ts-node/register src/seed-banners.ts
try {
  await seedMediaAndBanners();
  process.exit(0);
} catch (error) {
  console.error("Error during seeding:", error);
  process.exit(1);
}
