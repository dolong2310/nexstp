import Stripe from "stripe";

export type ProductMetadata = {
  id: string;
  name: string;
  price: number;
  stripeAccountId: string;
  launchpad: string;
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
