/**
 * Server-only Telegram delivery. The bot token is read from the server environment
 * (TELEGRAM_BOT_TOKEN, no NEXT_PUBLIC_ prefix) and is never logged or returned:
 * the request URL contains it, so only status codes / Telegram's short description are logged.
 */

const LIMIT = 4000; // Telegram allows 4096 chars per message

/** Splits on line breaks so long briefs arrive as several readable messages. */
function split(message: string): string[] {
  const parts: string[] = [];
  let current = "";
  for (const line of message.split("\n")) {
    const piece = line.length > LIMIT ? line.slice(0, LIMIT) : line;
    if (current && current.length + piece.length + 1 > LIMIT) {
      parts.push(current);
      current = "";
    }
    current = current ? `${current}\n${piece}` : piece;
  }
  if (current) parts.push(current);
  return parts;
}

export const telegramConfigured = () => Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

/** Sends plain text (no parse_mode, so user input can't inject markup). Returns false on any failure. */
export async function sendToTelegram(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not configured");
    return false;
  }

  for (const text of split(message)) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { description?: string } | null;
        console.error(`[telegram] sendMessage failed: ${res.status} ${data?.description ?? ""}`.trim());
        return false;
      }
    } catch (err) {
      // never log the error object itself — its message/cause may contain the request URL
      console.error(`[telegram] sendMessage error: ${(err as Error).name}`);
      return false;
    }
  }
  return true;
}

/** Plain-text fallback of an HTML message: tags removed, entities restored. */
const htmlToPlain = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/**
 * Sends ready-made messages with Telegram HTML formatting (parse_mode "HTML"), in order.
 * Every message must already fit the limit and contain escaped user text.
 * If Telegram ever refuses the markup, the same message is sent once more as plain text,
 * so a brief is never lost because of formatting.
 */
export async function sendTelegramHtml(messages: string[]): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not configured");
    return false;
  }

  const post = (body: Record<string, unknown>) =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, disable_web_page_preview: true, ...body }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

  const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (const [i, html] of messages.entries()) {
    try {
      // Telegram allows about one message per second in a chat — space out the parts of a long brief
      if (i > 0) await pause(400);
      let res = await post({ text: html, parse_mode: "HTML" });
      if (res.status === 429) {
        // "Too Many Requests": wait as long as Telegram asks (capped) and try this part once more
        const data = (await res.json().catch(() => null)) as { parameters?: { retry_after?: number } } | null;
        await pause(Math.min(data?.parameters?.retry_after ?? 2, 10) * 1000);
        res = await post({ text: html, parse_mode: "HTML" });
      }
      if (res.status === 400) {
        console.error("[telegram] HTML message refused, resending as plain text");
        res = await post({ text: htmlToPlain(html) });
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { description?: string } | null;
        console.error(`[telegram] sendMessage failed: ${res.status} ${data?.description ?? ""}`.trim());
        return false;
      }
    } catch (err) {
      // never log the error object itself — its message/cause may contain the request URL
      console.error(`[telegram] sendMessage error: ${(err as Error).name}`);
      return false;
    }
  }
  return true;
}
