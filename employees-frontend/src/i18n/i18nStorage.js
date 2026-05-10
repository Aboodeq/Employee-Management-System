export const SUPPORTED_LANGUAGES = ["ar", "en"];
export const DEFAULT_LANGUAGE = "ar";
export const LANGUAGE_STORAGE_KEY = "ems_locale";

export const normalizeLanguage = (language) => {
  const normalized = String(language || "").toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : DEFAULT_LANGUAGE;
};

export const getStoredLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
};

export const storeLanguage = (language) => {
  const normalized = normalizeLanguage(language);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  return normalized;
};

export const languageDirection = (language) => (normalizeLanguage(language) === "ar" ? "rtl" : "ltr");
