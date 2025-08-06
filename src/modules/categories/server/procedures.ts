import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.find({
      collection: "categories",
      depth: 1, // Populate one level deep (subcategories), subcategories.[0] will be a type of Category
      pagination: false,
      where: {
        parent: {
          exists: false, // Only fetch top-level categories
        },
      },
      sort: "name", // Sort categories by name
    });

    const formattedData = data.docs.map((doc) => ({
      ...doc,
      subcategories: (doc.subcategories?.docs || []).map((subDoc) => ({
        // Because of "depth: 1" we are confident "doc" will be a type of Category
        ...(subDoc as Category),
        // subcategories: undefined, // Prevent further nesting
      })),
    }));

    return formattedData;
  }),
  getCategory: baseProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const categoriesData = await ctx.db.find({
        collection: "categories",
        limit: 1,
        pagination: false,
        where: {
          slug: { equals: input.slug },
        },
      });
      return categoriesData.docs[0] || null;
    }),
  getSubcategory: baseProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const subcategoriesData = await ctx.db.find({
        collection: "categories",
        limit: 1,
        pagination: false,
        depth: 1, // Populate parent category
        where: {
          slug: { equals: input.slug },
          parent: { exists: true }, // Chỉ lấy subcategories
        },
      });
      return subcategoriesData.docs[0] || null;
    }),
});
