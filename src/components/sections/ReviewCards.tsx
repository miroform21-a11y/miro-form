import Image from "next/image";
import { ratingFaces, type Review } from "@/data/reviews";
import { CountUp } from "@/components/ui/CountUp";
import { InView } from "@/components/ui/InView";
import type { Locale } from "@/i18n/locale";

const copy = {
  uk: { stars: "5 з 5", rating: "Середня оцінка клієнтів на Google та UpWork", happy: "задоволених", clients: "клієнтів компанії" },
  en: { stars: "5 out of 5", rating: "Average client rating on Google and Upwork", happy: "happy clients", clients: "and counting" },
} satisfies Record<Locale, Record<string, string>>;

function Stars({ size, color, animated = false, locale }: { size: "sm" | "lg"; color: "white" | "lime"; animated?: boolean; locale: Locale }) {
  const s = size === "lg" ? { w: 23.26, h: 24 } : { w: 17.45, h: 18 };
  return (
    <span className="flex items-center gap-1" role="img" aria-label={copy[locale].stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={s.w}
          height={s.h}
          viewBox="0 0 23.2615 24"
          fill="none"
          aria-hidden="true"
          className={animated ? "star-pop" : undefined}
          style={animated ? ({ "--i": i } as React.CSSProperties) : undefined}
        >
          <path
            d="M11.6308 2.5L14.4415 8.6L20.8385 9.4L16.0892 14L17.3492 20.6L11.6308 17.3L5.91231 20.6L7.17231 14L2.42308 9.4L8.82 8.6L11.6308 2.5Z"
            fill={color === "lime" ? "#AEEE05" : "white"}
          />
        </svg>
      ))}
    </span>
  );
}

export function RatingCard({ className = "", locale = "uk" }: { className?: string; locale?: Locale }) {
  const t = copy[locale];
  return (
    <InView
      className={`rating-card relative flex h-[560px] flex-col justify-end gap-[26px] overflow-hidden rounded-[32px] border border-white/8 px-[31px] pt-[230px] pb-8 max-[389px]:px-5 ${className}`}
    >
      <Image
        src="/images/reviews/rating-bg.png"
        alt=""
        width={1122}
        height={1402}
        sizes="610px"
        className="pointer-events-none absolute top-[-8.87%] left-[-24.21%] h-[108.86%] w-[150.23%] max-w-none"
      />
      {/* Glass star (rotated 178°) */}
      <div aria-hidden="true" className="pointer-events-none absolute top-[-500px] right-[-300px] flex h-[698.7px] w-[849px] items-center justify-center">
        <div className="float relative h-[670.3px] w-[826.15px] shrink-0 rotate-[178deg] overflow-hidden">
          <Image
            src="/images/about/glass-star.png"
            alt=""
            width={735}
            height={960}
            className="absolute top-[-8.83%] left-[5.67%] h-[81.92%] w-[71.95%] max-w-none"
          />
        </div>
      </div>
      <img src="/images/reviews/backdrop.svg" alt="" aria-hidden="true" className="pointer-events-none absolute bottom-1 left-[-110px] h-[245px] w-[606px] max-w-none" />

      <div className="relative flex flex-col gap-4">
        <CountUp
          to={4.9}
          decimals={1}
          duration={1400}
          className="block font-display text-[120px] leading-none font-bold tracking-[-0.06em] whitespace-nowrap text-white"
        />
        <Stars size="lg" color="white" animated locale={locale} />
        <p className="rating-fade w-[211px] text-[17px] leading-[1.5] font-medium text-white">{t.rating}</p>
      </div>

      <div className="rating-fade relative flex items-center gap-[9px]" style={{ "--d": "520ms" } as React.CSSProperties}>
        <div className="flex">
          {ratingFaces.map((src, i) => (
            <span
              key={src}
              className={`relative h-11 w-[42.65px] shrink-0 overflow-hidden rounded-full border-3 border-[#212121] ${i < 3 ? "-mr-2.5" : ""}`}
            >
              <Image src={src} alt="" width={96} height={96} className="size-full object-cover" />
            </span>
          ))}
        </div>
        <p className="font-display text-[12px] leading-[1.3] font-medium whitespace-nowrap text-white">
          <CountUp to={347} suffix="+" duration={1600} /> {t.happy}
          <br />
          {t.clients}
        </p>
      </div>
    </InView>
  );
}

function Monogram({ initials }: { initials: string }) {
  return (
    <span className="grid h-12 w-[46.5px] shrink-0 place-items-center rounded-full border border-lime/40 bg-[#1b1b1b] font-pixel text-[11px] leading-none text-lime">
      {initials}
    </span>
  );
}

export function ReviewCard({ review, variant, locale = "uk" }: { review: Review; variant: "desktop" | "mobile"; locale?: Locale }) {
  const mobile = variant === "mobile";
  return (
    <figure
      className={`flex flex-col justify-between rounded-[32px] border border-white/8 bg-[#111] px-8 py-[33px] transition-colors duration-500 hover:border-white/16 ${
        mobile ? "h-[295px]" : "min-h-[270px] gap-6"
      }`}
    >
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-center justify-between">
          <Stars size="sm" color="lime" locale={locale} />
          <span aria-hidden="true" className="font-display text-[44px] leading-[0.6] font-bold text-white/15">
            “
          </span>
        </div>
        <blockquote className={`leading-[1.55] text-white/85 ${mobile ? "text-[15px]" : "text-[16px]"}`}>
          {mobile ? (
            (review.mobileText ?? review.text)
          ) : review.lines ? (
            <>
              <span className="min-[1440px]:hidden">{review.text}</span>
              <span className="max-[1439px]:hidden">
                {review.lines[0]}
                <br />
                {review.lines[1]}
              </span>
            </>
          ) : (
            review.text
          )}
        </blockquote>
      </div>

      <figcaption className="flex items-center gap-3.5">
        {review.avatar ? (
          <span className="relative h-12 w-[46.5px] shrink-0 overflow-hidden rounded-full">
            <Image src={review.avatar.src} alt="" width={160} height={240} className="absolute max-w-none" style={review.avatar.style} />
          </span>
        ) : (
          <Monogram initials={review.initials ?? review.name.slice(0, 2)} />
        )}
        <span className="flex flex-col gap-1 whitespace-nowrap">
          <span className="font-display text-[15px] leading-display font-semibold text-white">{review.name}</span>
          <span className="text-[13px] leading-body text-white/50">{review.company}</span>
        </span>
      </figcaption>
    </figure>
  );
}
