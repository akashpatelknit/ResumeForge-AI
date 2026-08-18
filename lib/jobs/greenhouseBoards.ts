// Configured Greenhouse job boards to pull from — add more board tokens
// here as they're identified (find one from a company's public Greenhouse
// careers URL: boards.greenhouse.io/{board_token}). Each is fetched
// independently and cached independently (see greenhouseClient.ts), so
// adding one here is the entire integration step — no other code changes.
export interface GreenhouseBoard {
  boardToken: string;
  companyDisplayName: string;
}

// Every token below was verified live against
// https://boards-api.greenhouse.io/v1/boards/{token}/jobs before being
// added (a wrong token just silently returns zero jobs for that board, so
// it's worth checking rather than guessing — some obvious candidates like
// "notion", "doordash", "plaid", and "zapier" don't use this exact token
// and 404).
export const GREENHOUSE_BOARDS: GreenhouseBoard[] = [
  { boardToken: "razorpaysoftwareprivatelimited", companyDisplayName: "Razorpay" },
  { boardToken: "stripe", companyDisplayName: "Stripe" },
  { boardToken: "airbnb", companyDisplayName: "Airbnb" },
  { boardToken: "robinhood", companyDisplayName: "Robinhood" },
  { boardToken: "coinbase", companyDisplayName: "Coinbase" },
  { boardToken: "pinterest", companyDisplayName: "Pinterest" },
  { boardToken: "gitlab", companyDisplayName: "GitLab" },
  { boardToken: "reddit", companyDisplayName: "Reddit" },
  { boardToken: "asana", companyDisplayName: "Asana" },
  { boardToken: "figma", companyDisplayName: "Figma" },
  { boardToken: "discord", companyDisplayName: "Discord" },
  { boardToken: "twilio", companyDisplayName: "Twilio" },
  { boardToken: "lyft", companyDisplayName: "Lyft" },
  { boardToken: "affirm", companyDisplayName: "Affirm" },
  { boardToken: "webflow", companyDisplayName: "Webflow" },
  { boardToken: "postman", companyDisplayName: "Postman" },
  { boardToken: "brex", companyDisplayName: "Brex" },
  { boardToken: "flexport", companyDisplayName: "Flexport" },
  { boardToken: "instacart", companyDisplayName: "Instacart" },
  { boardToken: "doximity", companyDisplayName: "Doximity" },
  { boardToken: "cloudflare", companyDisplayName: "Cloudflare" },
  { boardToken: "udemy", companyDisplayName: "Udemy" },
  { boardToken: "elastic", companyDisplayName: "Elastic" },
  { boardToken: "dropbox", companyDisplayName: "Dropbox" },
  { boardToken: "nextdoor", companyDisplayName: "Nextdoor" },
];
