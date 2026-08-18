import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  GmailNotConnectedError,
  GmailReauthRequiredError,
  getValidAccessToken,
} from "@/lib/gmail/getValidAccessToken";

// Not in the original numbered route list, but required to fulfil "If no
// GmailAccount is connected (or token expired) when the modal opens, show
// a 'Connect Gmail' prompt" (section 6) — there was no existing endpoint
// the frontend could check this against. Actually attempts a token refresh
// (via getValidAccessToken) rather than just reading tokenExpiresAt, so a
// dead refresh token is caught here instead of surfacing only at send time.
// Also consumed by the Send Scheduler settings page's "Connected Email
// Account" card — connectedAt/tokenExpiresAt are included so both surfaces
// render from the same real GmailAccount row instead of drifting apart.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.gmailAccount.findUnique({ where: { userId } });
  if (!account) {
    return NextResponse.json({ connected: false, reason: "not_connected" as const });
  }

  try {
    await getValidAccessToken(userId);
    return NextResponse.json({
      connected: true as const,
      email: account.email,
      connectedAt: account.connectedAt.toISOString(),
      tokenExpiresAt: account.tokenExpiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof GmailReauthRequiredError) {
      return NextResponse.json({
        connected: false as const,
        reason: "reauth_required" as const,
        email: account.email,
        tokenExpiresAt: account.tokenExpiresAt.toISOString(),
      });
    }
    if (error instanceof GmailNotConnectedError) {
      return NextResponse.json({ connected: false as const, reason: "not_connected" as const });
    }
    console.error("Gmail status check failed:", error);
    return NextResponse.json({ connected: false as const, reason: "unknown" as const });
  }
}
