"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import ReviewForm from "./review-form";

interface Props {
  productId: string;
};

const ReviewSidebar = ({ productId }: Props) => {
  const trpc = useTRPC();
  const { data: reviews } = useSuspenseQuery(
    trpc.reviews.getOne.queryOptions({
      productId,
    })
  );

  return <ReviewForm productId={productId} initialData={reviews} />;
};

export default ReviewSidebar;
