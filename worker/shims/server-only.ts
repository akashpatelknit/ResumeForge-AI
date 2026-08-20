// No-op shim for the "server-only" marker package (see worker/tsconfig.json).
//
// The real "server-only" package always throws when imported outside
// Next.js's own bundler (its package.json only resolves to a no-op under
// the "react-server" export condition, which Next sets internally during
// its build). This standalone worker process isn't bundled by Next at all,
// so lib/ modules it imports that start with `import "server-only"`
// (getValidAccessToken.ts, sendMail.ts, aiGate.ts, etc., pulled in
// transitively via processOutreachSend.ts) would crash on startup.
//
// Setting Node's global --conditions=react-server flag "fixes" that but
// breaks far more than it fixes: React, Next, and Clerk all branch on that
// same condition for their OWN exports, and their react-server builds
// assume they're running inside Next's RSC renderer (e.g. @react-pdf/renderer
// pulls in plain React, which breaks under Next's stripped RSC React build).
//
// This is the surgical alternative: worker/tsconfig.json path-aliases the
// bare specifier "server-only" to THIS file only within the worker's own
// module graph (via tsx --tsconfig), so nothing else's resolution changes.
export {};
