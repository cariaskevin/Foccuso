import Stripe from "stripe";

/** Server-only Stripe instance. Never import this into a client component. */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
  appInfo: { name: "Velqor Society" },
});
