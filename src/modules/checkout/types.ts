import Stripe from "stripe";

export type ProductMetadata = {
  id: string;
  name: string;
  price: number;
  stripeAccountId: string;
  launchpad: string;
  launchpadSoldCount?: number; // Optional, only for launchpad products
};

export type CheckoutMetadata = {
  userId: string;
};

export type ExpandedLineItem = Stripe.LineItem & {
  price: Stripe.Price & {
    product: Stripe.Product & {
      metadata: ProductMetadata;
    };
  };
};
