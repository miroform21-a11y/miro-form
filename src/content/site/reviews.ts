import { ratingFaces, reviewsByLocale } from "@/data/reviews";
import type { Locale } from "@/i18n/locale";
import type { ReviewsContent } from "../types";

export const reviewsContent: Record<Locale, ReviewsContent> = {
  uk: {
    tag: "Відгуки",
    title: "Що кажуть клієнти",
    prev: "Попередні відгуки",
    next: "Наступні відгуки",
    carousel: "Відгуки клієнтів",
    starsLabel: "5 з 5",
    items: reviewsByLocale.uk,
    ratingCard: {
      score: 4.9,
      caption: "Середня оцінка клієнтів на Google та UpWork",
      clients: 347,
      clientsSuffix: "+",
      clientsLines: ["задоволених", "клієнтів компанії"],
      faces: ratingFaces,
    },
  },
  en: {
    tag: "Reviews",
    title: "What clients say",
    prev: "Previous reviews",
    next: "Next reviews",
    carousel: "Client reviews",
    starsLabel: "5 out of 5",
    items: reviewsByLocale.en,
    ratingCard: {
      score: 4.9,
      caption: "Average client rating on Google and Upwork",
      clients: 347,
      clientsSuffix: "+",
      clientsLines: ["happy clients", "and counting"],
      faces: [...ratingFaces],
    },
  },
};
