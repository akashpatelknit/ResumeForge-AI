import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getRazorpay } from "@/lib/razorpay";
import { getSubscriptionByUserId, createTrialSubscription } from "@/lib/db/subscription";

const TRIAL_DAYS = 7;

// Razorpay subscriptions require a fixed total_count (number of billing
// cycles) — there's no "until cancelled" option. 120 monthly cycles (10
// years) is the standard workaround for an effectively open-ended
// subscription; cancel/create() below ends it long before that matters.
const TOTAL_BILLING_CYCLES = 120;

// Clerk-authed. Creates (or reuses) a Razorpay customer for this user, then
// creates a Razorpay subscription against the Pro plan with the first
// charge delayed 7 days via `start_at` — this IS the trial, not a coupon
// or discount workaround. Returns just enough for the frontend to open
// Razorpay Checkout (see lib/razorpayCheckout.ts); the subscription only
// becomes real once the user completes authorization there, and the local
// Subscription row only becomes authoritative once the webhook confirms it
// (see app/api/webhooks/razorpay/route.ts).
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!planId) {
    console.error("RAZORPAY_PLAN_ID is not set");
    return NextResponse.json({ error: "Billing is not configured" }, { status: 500 });
  }

  const existing = await getSubscriptionByUserId(userId);
  if (existing && (existing.status === "trialing" || existing.status === "active")) {
    return NextResponse.json({ error: "You already have an active subscription" }, { status: 400 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  const name = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : undefined;

  if (!email) {
    return NextResponse.json({ error: "A verified email is required to subscribe" }, { status: 400 });
  }

  const razorpay = getRazorpay();

  try {
    // Reuse the customer we already created for this user (e.g. they
    // cancelled and are resubscribing) rather than creating a duplicate.
    let customerId = existing?.razorpayCustomerId;
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name: name || email,
        email,
        fail_existing: 0,
      });
      customerId = customer.id;
    }

    const startAtSeconds = Math.floor(Date.now() / 1000) + TRIAL_DAYS * 24 * 60 * 60;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: TOTAL_BILLING_CYCLES,
      customer_notify: 1,
      start_at: startAtSeconds,
      notes: { userId },
    });

    const trialEndsAt = new Date(startAtSeconds * 1000);

    await createTrialSubscription({
      userId,
      razorpaySubscriptionId: subscription.id,
      razorpayCustomerId: customerId,
      trialEndsAt,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      trialEndsAt,
      prefill: { email, name },
    });
  } catch (error) {
    console.error("Failed to create Razorpay subscription:", error);
    return NextResponse.json({ error: "Failed to start your subscription. Please try again." }, { status: 500 });
  }
}
