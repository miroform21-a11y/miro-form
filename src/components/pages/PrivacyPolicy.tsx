import { routes, type Locale } from "@/i18n/locale";
import { siteContent } from "@/content";
import type { PrivacyContent } from "@/content/types";

/** /privacy and /en/privacy-policy (the text is in content/site/privacy.ts) */
export function PrivacyPolicy({ locale = "uk", content = siteContent[locale].privacy }: { locale?: Locale; content?: PrivacyContent }) {
  const { back, title, sections } = content;
  return (
    <main className="min-h-screen bg-ink px-5 py-12 md:px-8 md:py-20">
      <article className="mx-auto max-w-[760px]">
        <a
          href={routes[locale].home}
          className="inline-flex items-center gap-2 rounded-full border border-white/18 px-5 py-2.5 font-display text-[12px] leading-none font-medium tracking-[0.04em] text-white uppercase transition-colors duration-300 hover:border-lime hover:text-lime"
        >
          {back}
        </a>
        {/* below 430px the 34px size would push the long Ukrainian word past the screen edge */}
        <h1 className="mt-10 font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em] break-words text-white max-[429px]:text-[28px] md:text-[52px]">{title}</h1>
        <div className="mt-10 flex flex-col gap-9">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-[18px] leading-display font-semibold text-lime md:text-[20px]">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 text-[15px] leading-[1.6] text-white/75 md:text-[16px]">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
