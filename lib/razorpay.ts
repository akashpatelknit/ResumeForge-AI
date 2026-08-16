import "server-only";
import Razorpay from "razorpay";

let client: Razorpay | null = null;

// Constructed lazily (and memoized) so a missing key at import time doesn't
// crash the whole module graph — mirrors lib/redis.ts's pattern, except
// billing must fail loudly rather than fail open, so this throws instead
// of returning null.
export function getRazorpay(): Razorpay {
  if (client) return client;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set — billing routes cannot run without them.",
    );
  }

  client = new Razorpay({ key_id, key_secret });
  return client;
}
