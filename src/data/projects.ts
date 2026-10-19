import type { Locale } from "@/i18n/locale";

/** Image box inside the media frame, in % of the frame (exact values from Figma). */
export type ProjectCrop = { left: number; top: number; width: number; height: number };

/** A recording for one frame proportion (width / height) and its first frame */
export type VideoVariant = { ratio: number; src: string; poster: string };

export type Project = {
  id: string;
  title: string;
  description: string;
  /** Shorter copy used in the mobile slider (from Figma) */
  mobileDescription?: string;
  tags: string[];
  image: { src: string; width: number; height: number };
  /** Screen recordings layered over `image`: `desktop` (hover, bento) is optional, `mobile` serves the touch layouts. Remove to show only the photo. */
  video?: { desktop?: string; mobile: string; mobileVariants?: VideoVariant[] };
  crop: ProjectCrop;
  mobileCrop: ProjectCrop;
  /** Picture for phones and tablets instead of `image` (`mobileCrop` refers to it) */
  mobileImage?: { src: string; width: number; height: number };
  /** Phones: the picture fills the frame like the video (cover, top-aligned) instead of `mobileCrop` */
  mobileCover?: boolean;
  /** Title font sizes from Figma: desktop / mobile */
  titleSize: [number, number];
  href: string;
};

export const projects: Project[] = [
  {
    id: "nef-life",
    title: "NEF LIFE",
    description: "Оазис тисячі в центрі Балі",
    tags: ["Landing Page", "Figma", "Framer"],
    image: { src: "/images/works/nef-life-desktop.png", width: 1920, height: 1080 },
    mobileImage: { src: "/images/works/nef-life-mobile-v2.png", width: 1230, height: 848 },
    video: { desktop: "/videos/nef-life-preview.mp4", mobile: "/videos/nef-life-preview-mobile.mp4" },
    crop: { left: 0, top: 0, width: 100, height: 105.17 },
    mobileCrop: { left: 0, top: 0, width: 100, height: 100 },
    mobileCover: true,
    titleSize: [30, 22],
    href: "https://chetkov.pro/",
  },
  {
    id: "we-padel",
    title: "We Padel",
    description: "Місце, де спорт стає задоволенням",
    tags: ["Landing Page", "Next.js"],
    /** Desktop: the whole first screen + the "Падел. Природа. Атмосфера" block, real screens stacked to the 380x430 frame */
    image: { src: "/images/works/we-padel-desktop-v2.png", width: 2160, height: 2444 },
    mobileImage: { src: "/images/works/we-padel-phone-173.png", width: 1440, height: 832 },
    video: {
      mobile: "/videos/we-padel-phone-192.mp4",
      // the first screen is 100vh on this site: each recording shows it whole at its own proportion
      mobileVariants: [173, 182, 192, 203, 214].map((r) => ({ ratio: r / 100, src: `/videos/we-padel-phone-${r}.mp4`, poster: `/images/works/we-padel-phone-${r}.png` })),
    },
    crop: { left: 0, top: 0, width: 100, height: 100 },
    mobileCrop: { left: 0, top: 0, width: 100, height: 110.8 },
    mobileCover: true,
    titleSize: [30, 22],
    href: "https://www.we-padel.fun/",
  },


  {
    id: "car-rental",
    title: "Car Rental",
    description: "Стиль. Свобода руху",
    tags: ["Landing Page", "Framer"],
    /** Desktop: two real screens of the site stacked to the 380x370 frame (no video on desktop) */
    image: { src: "/images/works/car-rental-desktop.png", width: 2160, height: 2104 },
    mobileImage: { src: "/images/works/car-rental.png", width: 1256, height: 1908 },
    video: { mobile: "/videos/prestige-rent-preview-mobile.mp4" },
    crop: { left: 0, top: 0, width: 100, height: 100 },
    mobileCrop: { left: 0, top: 0, width: 100, height: 245.16 },
    titleSize: [30, 20],
    href: "https://www.prestige-rent.info/",
  },  {
    id: "bloomly",
    title: "Ліжка з масиву бука",
    description: "Натурально, надійно, з душею",
    tags: ["Landing Page", "webflow"],
    image: { src: "/images/works/bloomly-beds-desktop.png", width: 1536, height: 864 },
    mobileImage: { src: "/images/works/bloomly-beds-card.png", width: 1316, height: 848 },
    video: { desktop: "/videos/bloomly-beds-preview.mp4", mobile: "/videos/bloomly-beds-preview-card.mp4" },
    crop: { left: 0, top: 0, width: 100, height: 122.24 },
    mobileCrop: { left: 0, top: 0, width: 100, height: 103.9 },
    mobileCover: true,
    titleSize: [30, 19],
    href: "https://blooomly.space/",
  },  {
    id: "avalon",
    title: "Avalon x Ready to Fight",
    description: "Інвестиційний проєкт Avalon з Олександром Усиком",
    mobileDescription: "Проєкт Avalon з Олександром Усиком",
    tags: ["Landing Page", "Framer"],
    image: { src: "/images/works/avalon.png", width: 999, height: 497 },
    video: { desktop: "/videos/avalon-preview.mp4", mobile: "/videos/avalon-preview-540.mp4" },
    crop: { left: 0.06, top: -0.1, width: 99.97, height: 100 },
    mobileCrop: { left: 0, top: 0, width: 100, height: 100 },
    titleSize: [30, 17],
    href: "https://om-residence.com/ua",
  },
  {
    id: "padel-alicante",
    title: "Padel Alicante",
    description: "Сучасний падел-клуб в Аліканте",
    tags: ["Landing Page", "Next.js"],
    image: { src: "/images/works/padel-alicante.png", width: 1256, height: 1908 },
    video: { mobile: "/videos/padel-alicante-preview-540.mp4" },
    crop: { left: 0.2, top: 0.11, width: 99.83, height: 151.17 },
    mobileCrop: { left: 0, top: 0, width: 100, height: 245.16 },
    titleSize: [25, 22],
    href: "https://top-padel.pro/",
  },
];

/** Taken off the list, kept with its photo and videos so it can be put back */
export const archivedProjects: Project[] = [
  {
    id: "modular-homes",
    title: "Modern Modular Homes",
    description: "Функціональні будинки сучасного формату",
    mobileDescription: "Будинки сучасного формату",
    tags: ["Website", "Figma", "Framer"],
    image: { src: "/images/works/modular-homes.png", width: 1920, height: 1028 },
    video: { desktop: "/videos/modular-homes-preview.mp4", mobile: "/videos/modular-homes-preview-540.mp4" },
    crop: { left: -0.39, top: 0.13, width: 100.83, height: 102.5 },
    mobileCrop: { left: 0, top: 0, width: 101.23, height: 100 },
    titleSize: [30, 16],
    href: "https://chetkov.pro/",
  },
];

/** Total number of delivered projects shown in the counter */
export const projectsTotal = "40+";

/** English descriptions; media, crops, videos and links are the same objects as on the Ukrainian site */
const projectCopyEn: Record<string, Partial<Pick<Project, "title" | "description" | "mobileDescription">>> = {
  "nef-life": { description: "An oasis of calm in the heart of Bali" },
  "car-rental": { description: "Style. Freedom to move" },
  "we-padel": { description: "Where sport becomes pure joy" },
  bloomly: { title: "Solid Beech Beds", description: "Natural, reliable, made with soul" },
  "modular-homes": { description: "Functional homes for modern living", mobileDescription: "Homes for modern living" },
  avalon: { description: "Avalon investment project with Oleksandr Usyk", mobileDescription: "Avalon project with Oleksandr Usyk" },
  "padel-alicante": { description: "A modern padel club in Alicante" },
};

export const projectsByLocale: Record<Locale, Project[]> = {
  uk: projects,
  en: projects.map((p) => ({ ...p, mobileDescription: undefined, ...projectCopyEn[p.id] })),
};
