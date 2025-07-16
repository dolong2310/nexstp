import ProductView from "@/modules/products/views/product-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

type Props = {
  params: Promise<{
    slug: string;
    productId: string;
  }>;
};

const ProductDetailPage = async ({ params }: Props) => {
  const { slug, productId: id } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.products.getOne.queryOptions({ id }));
  // void queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({ slug }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductView productId={id} tenantSlug={slug} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProductDetailPage;
