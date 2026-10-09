/** Name of the hidden anti-bot field; people never see or fill it, naive bots do. */
export const HONEYPOT = "website_url";

/** Off-screen, unfocusable and hidden from assistive tech, so it never affects the layout or a real visitor. */
export function Honeypot() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Website
        <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/** Reads the honeypot value from the submitted form (call before any await). */
export const readHoneypot = (form: HTMLFormElement) => String(new FormData(form).get(HONEYPOT) ?? "");
