import type { Budget, ProjectType } from "@/data/pricing";

export type Lead = {
  name: string;
  contact: string;
  projectType: ProjectType;
  /** Not asked in the pricing popup */
  budget?: Budget;
  message: string;
};

/**
 * Sends a lead from the contact form.
 *
 * TODO: connect the real destination (Supabase / Telegram bot / e-mail).
 * Until then the request is simulated so the UI states can be tested.
 */
export async function submitLead(lead: Lead): Promise<void> {
  if (process.env.NODE_ENV !== "production") console.info("[lead]", lead);
  await new Promise((resolve) => setTimeout(resolve, 900));
}
