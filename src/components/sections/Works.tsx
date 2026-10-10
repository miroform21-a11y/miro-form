import Image from "next/image";
import { projectsByLocale, projectsTotal, type Project } from "@/data/projects";
import type { Locale } from "@/i18n/locale";
import { SectionTag } from "@/components/ui/SectionTag";
import { PillButton } from "@/components/ui/PillButton";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "./ProjectCard";
import { WorksSlider } from "./WorksSlider";

/** Bento rows from Figma: [wide | 407px] / [407px | wide] / [wide | 407px] */
const bento = (projects: Project[]) =>
  [
    { items: [projects[0], projects[1]], narrow: "right", height: 600 },
    { items: [projects[2], projects[3]], narrow: "left", height: 540 },
    { items: [projects[4], projects[5]], narrow: "right", height: 600 },
  ] as const;

const copy = {
  uk: { tag: "Роботи", title: "Наші проєкти", all: "Усі роботи" },
  en: { tag: "Work", title: "Our projects", all: "All projects" },
} satisfies Record<Locale, Record<string, string>>;

export function Works({ locale = "uk" }: { locale?: Locale }) {
  const t = copy[locale];
  const projects = projectsByLocale[locale];
  const rows = bento(projects);
  const counter = `( ${String(projects.length).padStart(2, "0")} / ${projectsTotal} )`;
  return (
    <section id="works" className="relative z-10 overflow-x-clip bg-ink px-2 pt-6 pb-5 md:px-[33px] md:pt-[82px] md:pb-[83px]">
      {/* Purple 3D star overlapping the sheet's top edge */}
      <div
        aria-hidden="true"
        className="float pointer-events-none absolute top-[-120px] left-[150px] z-10 size-[290px] md:top-[-230px] md:left-[max(148px,calc(50%-572px))] md:size-[644px] max-lg:md:left-[60px] max-lg:md:size-[460px] max-lg:md:top-[-170px]"
      >
        <Image src="/images/works/star.png" alt="" width={736} height={736} sizes="(min-width: 768px) 644px, 290px" className="size-full object-cover" />
      </div>

      <div className="mx-auto max-w-[1375px] overflow-hidden rounded-[32px] bg-paper px-4 py-10 text-ink-2 md:rounded-[48px] md:px-10 md:pt-[146px] md:pb-[118px] lg:pr-[58px] lg:pl-[57px]">
        {/* Header */}
        <div className="flex flex-col gap-3.5 pb-2 md:gap-6 md:pb-0 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="flex flex-col gap-5 md:gap-6">
            <SectionTag tone="light" className="self-start pr-[27px]">
              {t.tag}
            </SectionTag>
            <h2 className="font-display text-[34px] leading-display font-medium tracking-[-0.04em] whitespace-nowrap md:text-[48px] xl:text-[64px]">
              {t.title}
            </h2>
          </Reveal>

          <Reveal delay={100} className="flex items-center gap-[37px]">
            <p className="font-pixel text-[13px] leading-pixel whitespace-nowrap text-ink-2/50 md:text-[18px]">{counter}</p>
            <div className="hidden md:block">
              <PillButton href="#contact" variant="dark" circleSize={44} gap={12} className="h-[60px] w-[190px] pr-2 pl-[27px]">
                {t.all}
              </PillButton>
            </div>
          </Reveal>
        </div>

        {/* Mobile slider */}
        <div className="mt-4 md:hidden">
          <WorksSlider projects={projects} locale={locale} />
          <PillButton href="#contact" variant="dark" circleSize={44} className="mt-6 h-[60px] w-full pr-2 pl-[27px]">
            {t.all}
          </PillButton>
        </div>

        {/* Tablet: 2-column grid */}
        <div className="mt-12 hidden grid-cols-2 items-start gap-4 md:grid lg:hidden">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={(i % 2) * 80}>
              <ProjectCard
                project={project}
                variant="mobile"
                locale={locale}
                className="h-[360px]"
              />
            </Reveal>
          ))}
        </div>

        {/* Desktop bento */}
        <div className="mt-[60px] hidden flex-col gap-5 lg:flex">
          {rows.map((row, r) => (
            <div key={r} className="flex gap-[19px]" style={{ height: row.height }}>
              {row.items.map((project, i) => {
                const isNarrow = (row.narrow === "left" && i === 0) || (row.narrow === "right" && i === 1);
                return (
                  <Reveal
                    key={project.id}
                    delay={i * 90}
                    className={isNarrow ? "w-[clamp(340px,32.3%,407px)] shrink-0" : "min-w-0 flex-1"}
                  >
                    <ProjectCard
                      project={project}
                      variant="desktop"
                      locale={locale}
                      className={`h-full ${isNarrow ? "[--project-title-max:clamp(22px,2.1vw,30px)]" : "[--project-title-max:clamp(24px,2.2vw,30px)]"}`}
                    />
                  </Reveal>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
