/**
 * How package prices are shown, in one place for the site, the admin hints and the admin preview.
 * To go back to "$390", set `position` to "before". A space between the amount and the symbol: `gap: " "`.
 * Stored values may be written either way ("390$" or "$390"): the symbol is stripped and put back here,
 * so it is never doubled.
 */
export const PRICE_FORMAT = { symbol: "$", position: "after" as "before" | "after", gap: "" };

/** "390$" / "$1 290" / "$3,990" → "390" / "1 290" / "3,990" */
export const priceAmount = (value: string) => value.split(PRICE_FORMAT.symbol).join("").trim();

/** Text before and after the amount, e.g. { prefix: "", suffix: "$" } */
export function priceAffixes() {
  const { symbol, position, gap } = PRICE_FORMAT;
  return position === "after" ? { prefix: "", suffix: gap + symbol } : { prefix: symbol + gap, suffix: "" };
}

/** "$390" → "390$" (empty for an empty price) */
export function formatPrice(value: string) {
  const amount = priceAmount(value);
  if (!amount) return "";
  const { prefix, suffix } = priceAffixes();
  return prefix + amount + suffix;
}
