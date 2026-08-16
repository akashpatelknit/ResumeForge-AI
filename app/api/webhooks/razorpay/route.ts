import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { updateSubscriptionByRazorpayId } from "@/lib/db/subscription";

// Webhooks need Node's crypto (via razorpay's validateWebhookSignature) —
// not available on the edge runtime.
export const runtime = "nodejs";

interface RazorpaySubscriptionEntity {
  id: string;
  current_end?: number | null;
}

interface RazorpayPaymentEntity {
  id: string;
  subscription_id?: string | null;
}

interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    subscription?: { entity?: RazorpaySubscriptionEntity };
    payment?: { entity?: RazorpayPaymentEntity };
  };
}

// Source of truth for subscription state — the rest of the app (see
// lib/subscription/getUserPlan.ts) reads only the local Subscription
// table, never Razorpay's API live. This route is the only writer of
// "confirmed" subscription state.
//
// Signature verification is NOT optional: this endpoint is publicly
// reachable, so anyone could POST a fake "subscription.activated" event to
// grant themselves Pro for free without it. The raw request body is read
// as text (NOT parsed to JSON first) because the HMAC signature is
// computed over the exact bytes Razorpay sent — re-serializing parsed JSON
// can produce different bytes (key order, whitespace) and break
// verification.
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set — refusing to process webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  const isValid = Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    console.warn("Razorpay webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: RazorpayWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const subscriptionEntity = body.payload?.subscription?.entity;
  const paymentEntity = body.payload?.payment?.entity;

  try {
    switch (body.event) {
      case "subscription.activated":
      case "subscription.charged": {
        if (!subscriptionEntity?.id) break;
        await updateSubscriptionByRazorpayId(subscriptionEntity.id, {
          status: "active",
          currentPeriodEnd: subscriptionEntity.current_end
            ? new Date(subscriptionEntity.current_end * 1000)
            : undefined,
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        if (!subscriptionEntity?.id) break;
        await updateSubscriptionByRazorpayId(subscriptionEntity.id, { status: "cancelled" });
        break;
      }

      case "payment.failed": {
        // payment.failed fires for one-off payments too — only touch a
        // Subscription row when this failure is actually tied to one.
        const subscriptionId = paymentEntity?.subscription_id;
        if (!subscriptionId) break;
        await updateSubscriptionByRazorpayId(subscriptionId, { status: "past_due" });
        break;
      }

      default:
        // Unhandled event type — ack it anyway so Razorpay doesn't retry.
        break;
    }
  } catch (error) {
    console.error(`Failed to process Razorpay webhook event "${body.event}":`, error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
