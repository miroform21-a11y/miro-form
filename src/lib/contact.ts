/**
 * Shared rule for "phone or Telegram" fields — used by the forms (before sending) and by /api/lead.
 *
 * - Telegram username: "@name" (4+ chars, as before) or "name" without @ (Telegram's own rule:
 *   starts with a letter, 5–32 letters/digits/underscores). No digit count applies.
 * - Phone: only digits, spaces, "+", "-", "(", ")". All digits are counted; 10+ are required
 *   (a Ukrainian number has 10: 0XX XXX XX XX, or 12 with +380).
 * - Anything else (e.g. text with a few digits) is neither and gets the general message.
 */

export const PHONE_TOO_SHORT = "Перевірте номер телефону — здається, не вистачає цифр";
export const CONTACT_INVALID = "Вкажіть номер телефону або @нікнейм у Telegram";

const TELEGRAM_WITH_AT = /^@\w{4,32}$/;
const TELEGRAM_BARE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;
const PHONE_FORMAT = /^\+?[\d\s()-]+$/;

export const digitCount = (value: string) => value.replace(/\D/g, "").length;

/** A value that is written like a phone number (digits and phone punctuation only). */
export const looksLikePhone = (value: string) => PHONE_FORMAT.test(value) && /\d/.test(value);

export type ContactCheck = "ok" | "phone-too-short" | "invalid";

export function checkContact(raw: string): ContactCheck {
  const value = raw.trim();
  if (TELEGRAM_WITH_AT.test(value) || TELEGRAM_BARE.test(value)) return "ok";
  if (looksLikePhone(value)) return digitCount(value) >= 10 ? "ok" : "phone-too-short";
  return "invalid";
}

/** Error text for a "phone or Telegram" field, or undefined when the value is fine. */
export function contactError(raw: string): string | undefined {
  const result = checkContact(raw);
  return result === "ok" ? undefined : result === "phone-too-short" ? PHONE_TOO_SHORT : CONTACT_INVALID;
}

/** For phone-only fields (the brief): only a phone-formatted value with too few digits is an error. */
export const phoneError = (raw: string) => (looksLikePhone(raw.trim()) && digitCount(raw) < 10 ? PHONE_TOO_SHORT : undefined);
