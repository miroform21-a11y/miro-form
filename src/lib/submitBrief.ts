/** A filled-in brief: question → answer (strings / lists), plus attached files. */
export type BriefPayload = {
  answers: Record<string, string | string[]>;
  files: File[];
};

/**
 * Sends the brief.
 *
 * TODO: connect the same real destination as submitLead (Supabase / Telegram bot / e-mail),
 * including file upload. Until then the request is simulated so the UI states can be tested.
 */
export async function submitBrief({ answers, files }: BriefPayload): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info("[brief]", answers, files.map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`));
  }
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
