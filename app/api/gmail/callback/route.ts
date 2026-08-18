import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createOAuthClient, fetchConnectedEmail } from "@/lib/gmail/oauthClient";
import { encryptToken } from "@/lib/crypto/tokenCipher";

const STATE_COOKIE = "gmail_oauth_state";
const SETTINGS_PATH = "/dashboard/outreach/settings";

// Google redirects the browser here after the consent screen. `proxy.ts`
// already runs auth.protect() on every /api/* route (this one isn't in the
// public-route allowlist), so by the time this handler runs the Clerk
// session cookie has already been verified — the redirect chain
// (our app -> Google -> back here) never leaves the browser, so that
// first-party cookie survives the whole round trip.
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const url = new URL(request.url);

  function toSettings(status: string) {
    const dest = new URL(SETTINGS_PATH, url.origin);
    dest.searchParams.set("gmail", status);
    const response = NextResponse.redirect(dest);
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const consentError = url.searchParams.get("error");
  if (consentError) {
    console.warn("Gmail OAuth consent was denied or errored:", consentError);
    return toSettings("denied");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    console.warn("Gmail OAuth callback failed state validation");
    return toSettings("error");
  }

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      // /connect always sets prompt=consent, which should force a fresh
      // refresh_token every time — missing one here means something
      // upstream (Google Cloud project config, scope mismatch) is off.
      console.error("Google did not return both an access token and a refresh token");
      return toSettings("error");
    }

    const email = await fetchConnectedEmail(tokens.access_token);
    const tokenExpiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 55 * 60 * 1000);

    await prisma.gmailAccount.upsert({
      where: { userId },
      create: {
        userId,
        email,
        accessToken: encryptToken(tokens.access_token),
        refreshToken: encryptToken(tokens.refresh_token),
        tokenExpiresAt,
      },
      update: {
        email,
        accessToken: encryptToken(tokens.access_token),
        refreshToken: encryptToken(tokens.refresh_token),
        tokenExpiresAt,
      },
    });

    return toSettings("connected");
  } catch (error) {
    console.error("Gmail OAuth callback failed:", error);
    return toSettings("error");
  }
}
