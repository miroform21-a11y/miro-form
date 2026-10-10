import Image from "next/image";
import type { CSSProperties } from "react";
import type { Project, ProjectCrop } from "@/data/projects";
import { ArrowShot } from "@/components/ui/ArrowShot";
import { ProjectVideo } from "./ProjectVideo";
import type { Locale } from "@/i18n/locale";

const copy = {
  uk: { screenshot: "скріншот сайту", video: "відео сайту", open: "відкрити сайт проєкту" },
  en: { screenshot: "website screenshot", video: "website video", open: "open the project website" },
} satisfies Record<Locale, Record<string, string>>;

function Media({ project, crop, sizes, radius, mobile, locale }: { project: Project; crop: ProjectCrop; sizes: string; radius: string; mobile: boolean; locale: Locale }) {
  const { src, width, height } = project.image;
  const videoSrc = mobile ? project.video?.mobile : project.video?.desktop;
  return (
    <div className={`relative min-h-0 w-full flex-1 overflow-hidden ${radius}`}>
      <Image
        src={src}
        alt={`${project.title} — ${copy[locale].screenshot}`}
        width={width}
        height={height}
        sizes={sizes}
        className="absolute max-w-none"
        style={{ left: `${crop.left}%`, top: `${crop.top}%`, width: `${crop.width}%`, height: `${crop.height}%` }}
      />
      {videoSrc && (
        <ProjectVideo
          src={videoSrc}
          trigger={mobile ? "visible" : "hover"}
          delay={mobile ? 1000 : 0}
          label={`${project.title} — ${copy[locale].video}`}
        />
      )}
    </div>
  );
}

type Variant = "desktop" | "mobile";

export function ProjectCard({
  project,
  variant,
  className = "",
  style,
  locale = "uk",
}: {
  project: Project;
  variant: Variant;
  locale?: Locale;
  className?: string;
  style?: CSSProperties;
}) {
  const mobile = variant === "mobile";
  const [titleDesktop, titleMobile] = project.titleSize;

  return (
    <article
      className={`group/project pop-trigger @container relative flex flex-col overflow-hidden bg-white transition-[translate,box-shadow] duration-500 ease-(--ease-smooth) ${
        mobile
          ? "gap-(--card-gap,16px) rounded-[24px] px-2 pt-2 pb-(--card-pb,18px) active:-translate-y-1 active:shadow-[0_24px_60px_-30px_rgba(174,238,5,0.35)]"
          : "gap-[21px] rounded-[32px] px-3 pt-3 pb-7 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-30px_rgba(174,238,5,0.35)]"
      } ${className}`}
      style={style}
    >
      <Media
        project={project}
        crop={mobile ? project.mobileCrop : project.crop}
        sizes={mobile ? "342px" : "(min-width: 1024px) 60vw, 50vw"}
        radius={mobile ? "rounded-[18px]" : "rounded-[22px]"}
        mobile={mobile}
        locale={locale}
      />

      <div className={`relative flex shrink-0 flex-col ${mobile ? "h-(--card-info,auto) gap-2 px-2" : "h-[109px] gap-2.5 px-[19px]"}`}>
        <ul className={`flex flex-wrap items-center ${mobile ? "gap-1" : "gap-1.5"}`}>
          {project.tags.map((tag) => (
            <li
              key={tag}
              className={`rounded-full border-ink-2/25 bg-ink-2/4 font-display leading-display font-medium tracking-[0.04em] text-ink-2 uppercase ${
                mobile ? "border-[0.78px] py-[7px] pr-[11px] pl-[13px] text-[9.36px]" : "border py-[9px] pr-[14px] pl-4 text-[12px]"
              }`}
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className={`flex flex-col ${mobile ? "gap-1.5 pr-12" : "gap-2 pr-16"}`}>
          <h3
            className="font-display leading-display font-semibold tracking-[-0.02em] whitespace-nowrap text-ink-2"
            style={{ fontSize: mobile ? `min(${titleMobile}px, ${((titleMobile / 342) * 100).toFixed(3)}cqw)` : `min(${titleDesktop}px, var(--project-title-max, ${titleDesktop}px))` }}
          >
            {project.title}
          </h3>
          <p className={`leading-body text-ink-2/60 ${mobile ? "text-[13px]" : "text-[16px]"}`}>
            {mobile ? (project.mobileDescription ?? project.description) : project.description}
          </p>
        </div>

        <span
          aria-hidden="true"
          className={`absolute grid place-items-center overflow-hidden rounded-full bg-lime ${
            mobile ? "top-[26px] right-2 h-[44.8px] w-[43.4px]" : "top-9 right-[19px] h-14 w-[54.28px]"
          }`}
        >
          <ArrowShot color="#0A0A0A" size={mobile ? 16 : 20} />
        </span>
      </div>

      {/* The whole card (arrow included) opens the project site in a new tab */}
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.title} — ${copy[locale].open}`}
        className="absolute inset-0 z-[2] rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
      />
    </article>
  );
}
