import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  syncSubscriptionToProfile,
  revokeSubscriptionForCustomer,
} from "@/lib/subscription";

// The webhook must read the RAW request body to verify the signature, so we
// force the Node.js runtime and disable any body parsing/caching.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Every request is verified against STRIPE_WEBHOOK_SECRET
 * before we act on it – unsigned or tampered payloads are rejected with 400.
 *
 * Handled events:
 *  - checkout.session.completed    -> initial purchase: grant premium
 *  - customer.subscription.updated -> renewals / plan / status changes: re-sync
 *  - customer.subscription.deleted -> cancellation: revoke premium
 *  - invoice.payment_failed        -> failed payment: mark past_due (Stripe will
 *                                     also emit subscription.updated; we handle
 *                                     both defensively)
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Fetch the freshly created subscription and sync its truth to the user.
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await syncSubscriptionToProfile(subscription);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToProfile(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        await revokeSubscriptionForCustomer(customerId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Re-sync from the subscription so status becomes past_due/unpaid and
        // premium access is removed once the paid period lapses.
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await syncSubscriptionToProfile(subscription);
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries transient failures.
    const message = err instanceof Error ? err.message : "Handler error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
