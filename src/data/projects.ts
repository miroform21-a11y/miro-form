/** Image box inside the media frame, in % of the frame (exact values from Figma). */
export type ProjectCrop = { left: number; top: number; width: number; height: number };

export type Project = {
  id: string;
  title: string;
  description: string;
  /** Shorter copy used in the mobile slider (from Figma) */
  mobileDescription?: string;
  tags: string[];
  image: { src: string; width: number; height: number };
  /** Screen recordings layered over `image`: `desktop` (hover, bento) is optional, `mobile` serves the touch layouts. Remove to show only the photo. */
  video?: { desktop?: string; mobile: string };
  crop: ProjectCrop;
  mobileCrop: ProjectCrop;
  /** Title font sizes from Figma: desktop / mobile */
  titleSize: [number, number];
  href: string;
};

export const projects: Project[] = [
  {
    id: "car-rental",
    title: "Premium Car Rental",
    description: "Стиль. Комфорт. Свобода руху",
    tags: ["Landing Page", "Figma", "Framer"],
    image: { src: "/images/works/car-rental.png", width: 1256, height: 1908 },
    video: { desktop: "/videos/prestige-rent-preview.mp4", mobile: "/videos/prestige-rent-preview-540.mp4" },
    crop: { left: 0, top: 0, width: 99.99, height: 269.07 },
    mobileCrop: { left: 0, top: 0, width: 100, height: 245.16 },
    titleSize: [30, 20],
    href: "https://www.prestige-rent.info/",
  },
  {
    id: "we-padel",
    title: "We Padel",
    description: "Місце, де спорт стає задоволенням",
    tags: ["Landing Page", "Next.js"],
    image: { src: "/images/works/we-padel.png", width: 1538, height: 4096 },
    video: { mobile: "/videos/we-padel-preview-540.mp4" },
    crop: { left: 0, top: 0, width: 100, height: 222.14 },
    mobileCrop: { left: 0.04, top: 0.18, width: 100, height: 497.11 },
    titleSize: [30, 22],
    href: "https://www.we-padel.fun/",
  },
  {
    id: "bloomly",
    title: "Bloomly",
    description: "Грумінг для улюбленців",
    tags: ["Landing Page", "webflow"],
    image: { src: "/images/works/bloomly.png", width: 817, height: 4096 },
    video: { mobile: "/videos/bloomly-preview-540.mp4" },
    crop: { left: 0.08, top: -453.07, width: 100, height: 624.66 },
    mobileCrop: { left: 0, top: 0.28, width: 100, height: 1011.35 },
    titleSize: [30, 22],
    href: "https://blooomly.space/",
  },
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
  {
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

/** Total number of delivered projects shown in the counter */
export const projectsTotal = "40+";
