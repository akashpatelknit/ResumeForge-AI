import "server-only";
import { google } from "googleapis";

// Only gmail.send — this app never reads mail, only sends on the user's
// behalf. `userinfo.email` is added purely so the callback can learn which
// Gmail address was just connected (for display in Settings); Gmail's own
// `users.getProfile` needs gmail.readonly/metadata, which gmail.send does
// NOT grant, so there's no way to get the address from the Gmail API alone
// with a send-only scope.
export const GMAIL_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function createOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Gmail OAuth is not configured — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI",
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// access_type=offline + prompt=consent together guarantee Google returns a
// refresh_token — without prompt=consent, a user who previously granted
// this app access gets silently re-approved with no refresh_token in the
// response, which would leave GmailAccount unable to auto-refresh later.
export function buildGmailAuthUrl(state: string) {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_OAUTH_SCOPES,
    state,
  });
}

// Only available with the userinfo.email scope above — not part of the
// token exchange response itself.
export async function fetchConnectedEmail(accessToken: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Google account email (${res.status})`);
  }
  const data = (await res.json()) as { email?: string };
  if (!data.email) {
    throw new Error("Google did not return an email address for this account");
  }
  return data.email;
}
