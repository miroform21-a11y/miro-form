import type { BriefAnswers } from "@/data/brief";
import { botSignals, postForm } from "./submitLead";

/**
 * Sends the brief answers to /api/brief (validated on the server and delivered to Telegram).
 * Throws on any failure, so the wizard keeps the answers and shows its error message.
 */
export async function submitBrief(answers: BriefAnswers, trap?: string): Promise<void> {
  await postForm("/api/brief", { answers, ...botSignals(trap) });
}
