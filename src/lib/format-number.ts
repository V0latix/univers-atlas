import type { AtlasLocale } from "@/i18n/atlas-copy";

export const formatNumber = (value: number, locale: AtlasLocale = "fr") =>
  new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US").format(value);

export const formatDecimal = (value: number, locale: AtlasLocale) =>
  new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    maximumFractionDigits: 2,
  }).format(value);
