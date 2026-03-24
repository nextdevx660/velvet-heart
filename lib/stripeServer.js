import Stripe from "stripe";

import { adminDb, adminTimestamp } from "@/lib/firebaseAdmin";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

async function listCustomerSubscriptions(customerId) {
  if (!stripe || !customerId) {
    return [];
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });

  return subscriptions.data.filter((subscription) =>
    ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status),
  );
}

async function findCustomerByEmail(email) {
  if (!stripe || !email) {
    return null;
  }

  const customers = await stripe.customers.list({ email, limit: 10 });
  return customers.data[0] || null;
}

export async function syncUserPlanFromStripe({ uid, email }) {
  if (!stripe || !adminDb || !uid) {
    return { synced: false, plan: "free" };
  }

  const userRef = adminDb.collection("users").doc(uid);
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.data() || {};

  let customerId = userData.stripeCustomerId || null;
  let activeSubscriptions = customerId ? await listCustomerSubscriptions(customerId) : [];

  if (!activeSubscriptions.length) {
    const customer = await findCustomerByEmail(email || userData.email || "");
    customerId = customer?.id || customerId;
    activeSubscriptions = customerId ? await listCustomerSubscriptions(customerId) : [];
  }

  if (!activeSubscriptions.length) {
    return { synced: false, plan: userData.plan || "free" };
  }

  const subscription = activeSubscriptions[0];

  await userRef.set(
    {
      email: email || userData.email || null,
      plan: "pro",
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      updatedAt: adminTimestamp.serverTimestamp(),
    },
    { merge: true },
  );

  return { synced: true, plan: "pro", stripeCustomerId: customerId };
}
