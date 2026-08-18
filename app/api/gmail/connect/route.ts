import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { buildGmailAuthUrl } from "@/lib/gmail/oauthClient";

const STATE_COOKIE = "gmail_oauth_state";

// Navigation endpoint (GET, not the JSON-POST convention the rest of this
// app's API routes use) — the frontend sends the browser here with a plain
// link/location change, not fetch(), since the whole point is a top-level
// redirect to Google's consent screen.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Random CSRF nonce, round-tripped through Google's redirect and checked
  // against this same cookie in the callback — without it, an attacker
  // could send a victim their own OAuth code and link the attacker's Gmail
  // account to the victim's session.
  const state = crypto.randomBytes(16).toString("hex");

  let authUrl: string;
  try {
    authUrl = buildGmailAuthUrl(state);
  } catch (error) {
    console.error("Gmail OAuth is not configured:", error);
    return NextResponse.json(
      { error: "Gmail connection isn't configured on this server yet." },
      { status: 500 },
    );
  }

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
