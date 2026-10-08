import type { Budget } from "@/data/leads";

export type Lead = {
  /** "lead" — project request, "question" — the FAQ popup */
  kind: "lead" | "question";
  name?: string;
  contact: string;
  direction?: string;
  option?: string;
  /** Asked only in the contacts section form */
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
