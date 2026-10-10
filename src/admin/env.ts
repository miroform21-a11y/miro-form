/**
 * The demo admin has no authentication yet, so it never reaches the live site: a production build serves 404
 * under /admin unless it was explicitly built for a local demo with ADMIN_DEMO=1. `npm run dev` always shows it.
 */
export const adminEnabled = () => process.env.NODE_ENV !== "production" || process.env.ADMIN_DEMO === "1";
