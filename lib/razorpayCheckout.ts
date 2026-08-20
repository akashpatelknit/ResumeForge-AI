"use client";

interface RazorpayCheckoutOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: unknown) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayCheckoutInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptLoadPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout can only be opened in the browser"));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay Checkout")));
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay Checkout"));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

interface OpenCheckoutParams {
  subscriptionId: string;
  keyId: string;
  prefill?: { name?: string; email?: string };
  onSuccess: () => void;
  onDismiss?: () => void;
}

// Opens Razorpay's hosted Checkout modal for a subscription created via
// POST /api/subscription/create. A thin wrapper around their SDK only —
// no custom card-entry form, per the plan's requirement (and Razorpay's
// own PCI-scope guidance).
export async function openRazorpayCheckout({
  subscriptionId,
  keyId,
  prefill,
  onSuccess,
  onDismiss,
}: OpenCheckoutParams): Promise<void> {
  await loadCheckoutScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay Checkout failed to load");
  }

  const checkout = new window.Razorpay({
    key: keyId,
    subscription_id: subscriptionId,
    name: "Rezlo",
    description: "Pro subscription — ₹149/month",
    prefill,
    theme: { color: "#7c3aed" },
    handler: () => {
      // Razorpay's client-side "success" callback — NOT treated as proof of
      // payment. app/api/webhooks/razorpay/route.ts is the only source of
      // truth; this just tells the UI to show a "confirming..." state and
      // refetch status once the webhook has had a moment to land.
      onSuccess();
    },
    modal: {
      ondismiss: () => onDismiss?.(),
    },
  });

  checkout.open();
}
