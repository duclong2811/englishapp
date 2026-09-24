// Cloudflare's temporary UI preview has no server-side database.
// API routes short-circuit their database operations when CF_PREVIEW is enabled.
export const db: any = {};
