import { getQueryClient, trpc } from "@/trpc/server";
import { redirect } from "next/navigation";

export const prefetchApi = {
  tenant: async (slug: string) => {
    const queryClient = getQueryClient();

    try {
      await queryClient.prefetchQuery(
        trpc.tenants.getOne.queryOptions({ slug })
      );

      const tenant = queryClient.getQueryData(
        trpc.tenants.getOne.queryOptions({ slug }).queryKey
      );

      return { queryClient, tenant };
    } catch (error) {
      redirect("/");
    }
  },
  categoryAndSubCategory: async (
    slugCategory: string,
    slugSubCategory: string
  ) => {
    const queryClient = getQueryClient();

    try {
      await Promise.all([
        queryClient.prefetchQuery(
          trpc.categories.getCategory.queryOptions({ slug: slugCategory })
        ),
        queryClient.prefetchQuery(
          trpc.categories.getSubcategory.queryOptions({ slug: slugSubCategory })
        ),
      ]);

      const category = queryClient.getQueryData(
        trpc.categories.getCategory.queryOptions({ slug: slugCategory })
          .queryKey
      );

      const subCategory = queryClient.getQueryData(
        trpc.categories.getSubcategory.queryOptions({ slug: slugSubCategory })
          .queryKey
      );

      return {
        queryClient,
        categoryData: category,
        subcategoryData: subCategory,
      };
    } catch (error) {
      redirect("/");
    }
  },
  category: async (slug: string) => {
    const queryClient = getQueryClient();

    try {
      await queryClient.prefetchQuery(
        trpc.categories.getCategory.queryOptions({ slug })
      );

      const category = queryClient.getQueryData(
        trpc.categories.getCategory.queryOptions({ slug }).queryKey
      );

      return { queryClient, categoryData: category };
    } catch (error) {
      redirect("/");
    }
  },
  launchpad: async (id: string) => {
    const queryClient = getQueryClient();

    try {
      await queryClient.prefetchQuery(
        trpc.launchpads.getOne.queryOptions({ id })
      );

      const launchpad = queryClient.getQueryData(
        trpc.launchpads.getOne.queryOptions({ id }).queryKey
      );

      return { queryClient, launchpad };
    } catch (error) {
      redirect("/launchpads");
    }
  },
  libraryProduct: async (id: string) => {
    const queryClient = getQueryClient();

    try {
      await Promise.all([
        queryClient.prefetchQuery(
          trpc.library.getOne.queryOptions({ productId: id })
        ),
        queryClient.prefetchQuery(
          trpc.reviews.getOne.queryOptions({ productId: id })
        ),
      ]);

      const product = queryClient.getQueryData(
        trpc.library.getOne.queryOptions({ productId: id }).queryKey
      );

      if (product) {
        return { queryClient, productData: product };
      }
    } catch (error) {
      console.log("Error fetching product:", error);
    }

    try {
      await queryClient.prefetchQuery(
        trpc.launchpads.getOne.queryOptions({ id })
      );

      const launchpad = queryClient.getQueryData(
        trpc.launchpads.getOne.queryOptions({ id }).queryKey
      );

      if (launchpad) {
        return {
          queryClient,
          productData: {
            id: launchpad.id,
            name: launchpad.title,
            description: launchpad.description,
            image: launchpad.image,
          },
        };
      }
    } catch (launchpadError) {
      console.log("Error fetching launchpad:", launchpadError);
    }

    redirect("/library");
  },
  product: async (id: string) => {
    const queryClient = getQueryClient();

    try {
      await queryClient.prefetchQuery(
        trpc.products.getOne.queryOptions({ id })
      );

      const product = queryClient.getQueryData(
        trpc.products.getOne.queryOptions({ id }).queryKey
      );

      if (!product) {
        throw new Error("Product not found");
      }

      return { queryClient, product };
    } catch (error) {
      redirect("/");
    }
  },
};
