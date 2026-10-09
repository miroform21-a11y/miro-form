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

/** When this page was loaded — the server ignores forms "filled in" faster than a person could. */
const loadedAt = Date.now();

/** Bot signals sent along with every form: time on page + the hidden honeypot field (must stay empty). */
export const botSignals = (trap = "") => ({ t: Date.now() - loadedAt, trap });

/** POSTs to a same-site API route; throws on any failure so the form shows its error state. */
export async function postForm(url: string, payload: object): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
  if (!res.ok || !data?.ok) throw new Error(`Form submit failed (${res.status})`);
}

/** Sends a lead from the contact form / popups to /api/lead (delivered to Telegram on the server). */
export async function submitLead(lead: Lead, trap?: string): Promise<void> {
  await postForm("/api/lead", { ...lead, ...botSignals(trap) });
}
