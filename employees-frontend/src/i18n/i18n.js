import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  getStoredLanguage,
  languageDirection,
  normalizeLanguage,
  storeLanguage,
} from "./i18nStorage";
import { translations } from "./translations";

export const I18nContext = createContext(null);

const getValue = (language, key) =>
  key.split(".").reduce((value, part) => (value == null ? undefined : value[part]), translations[language]);

export const interpolate = (text, values = {}) =>
  Object.entries(values).reduce(
    (current, [key, value]) => current.replaceAll(`{${key}}`, String(value)),
    text,
  );

export const translate = (key, values = {}, language = getStoredLanguage()) => {
  const normalized = normalizeLanguage(language);
  const value = getValue(normalized, key) ?? getValue(DEFAULT_LANGUAGE, key) ?? key;
  return typeof value === "string" ? interpolate(value, values) : value;
};

const localeMap = {
  ar: "ar-SY",
  en: "en-US",
};

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage);

  const setLanguage = (nextLanguage) => {
    const normalized = storeLanguage(nextLanguage);
    setLanguageState(normalized);
  };

  useEffect(() => {
    const dir = languageDirection(language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [language]);

  const value = useMemo(() => {
    const dir = languageDirection(language);
    const locale = localeMap[language] || localeMap[DEFAULT_LANGUAGE];

    return {
      language,
      dir,
      isRtl: dir === "rtl",
      setLanguage,
      toggleLanguage: () => setLanguage(language === "ar" ? "en" : "ar"),
      t: (key, values = {}) => translate(key, values, language),
      formatNumber: (value, options = {}) => new Intl.NumberFormat(locale, options).format(value),
      formatDate: (value, options = {}) => {
        if (!value) return "";
        return new Intl.DateTimeFormat(locale, options).format(new Date(value));
      },
    };
  }, [language]);

  return createElement(I18nContext.Provider, { value }, children);
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
};
