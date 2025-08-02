import type { Stripe } from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { ExpandedLineItem } from "@/modules/checkout/types";

export async function POST(request: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await request.blob()).text(),
      request.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (error! instanceof Error) {
      console.log(error);
    }

    console.log(`⚠️ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log(`✅ Success: ${event.id} - ${event.type}`);

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "account.updated",
  ];

  const payload = await getPayload({ config });

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;

          if (!data.metadata?.userId) {
            throw new Error("User ID is required");
          }

          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });

          if (!user) {
            throw new Error("User not found");
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ["line_items.data.price.product"],
            },
            {
              stripeAccount: event.account,
            }
          );

          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error("No line items found in the session");
          }

          const lineItems = expandedSession.line_items
            .data as ExpandedLineItem[];
          console.log(
            "metadata: ",
            lineItems.map((item) => item.price.metadata)
          );
          console.log(
            "product: ",
            lineItems.map((item) => item.price.product)
          );
          console.log(
            "lineItem MAPPING: ",
            lineItems.map((item) => ({
              id: item.id,
              productId: item.price.product.metadata.id,
              name: item.price.product.metadata.name,
              launchpad: item.price.product.metadata.launchpad,
            }))
          );

          for (const item of lineItems) {
            await payload.create({
              collection: "orders",
              data: {
                stripeCheckoutSessionId: data.id,
                stripeAccountId: event.account,
                user: user.id,
                product: item.price.product.metadata.id,
                name: item.price.product.metadata.name,
                launchpad: item.price.product.metadata.launchpad,
              },
            });
          }

          break;
        case "account.updated":
          data = event.data.object as Stripe.Account;

          await payload.update({
            collection: "tenants",
            where: {
              stripeAccountId: {
                equals: data.id,
              },
            },
            data: {
              stripeDetailsSubmitted: data.details_submitted,
            },
          });

          break;
        default:
          throw new Error(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`⚠️ Error processing webhook: ${error}`);
      return NextResponse.json(
        { message: `Webhook handler failed: ${error}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { message: "Webhook processed successfully" },
    { status: 200 }
  );
}
