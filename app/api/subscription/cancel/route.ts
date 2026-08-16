import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRazorpay } from "@/lib/razorpay";
import { getSubscriptionByUserId, updateSubscriptionStatusForUser } from "@/lib/db/subscription";

// Clerk-authed. Cancels the user's subscription at Razorpay immediately
// (not at cycle end — there's no annual/proration concern here, just the
// ₹149/month plan) and reflects that locally right away rather than
// waiting on the subscription.cancelled webhook, so the settings page
// updates instantly. The webhook handler applies the same update
// idempotently when it arrives.
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getSubscriptionByUserId(userId);
  if (!subscription?.razorpaySubscriptionId) {
    return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
  }

  if (subscription.status === "cancelled") {
    return NextResponse.json({ error: "Subscription is already cancelled" }, { status: 400 });
  }

  try {
    await getRazorpay().subscriptions.cancel(subscription.razorpaySubscriptionId, false);
    await updateSubscriptionStatusForUser(userId, "cancelled");
    return NextResponse.json({ status: "cancelled" });
  } catch (error) {
    console.error("Failed to cancel Razorpay subscription:", error);
    return NextResponse.json({ error: "Failed to cancel your subscription. Please try again." }, { status: 500 });
  }
}
