import type { BriefAnswers } from "@/data/brief";
import type { Locale } from "@/i18n/locale";
import { botSignals, langField, postForm } from "./submitLead";

/**
 * Sends the brief answers to /api/brief (validated on the server and delivered to Telegram).
 * Throws on any failure, so the wizard keeps the answers and shows its error message.
 */
export async function submitBrief(answers: BriefAnswers, trap?: string, locale: Locale = "uk"): Promise<void> {
  await postForm("/api/brief", { answers, ...botSignals(trap), ...langField(locale) });
}
