import { createContext, useContext } from 'react';
import en from './en';
import vi from './vi';

export type Language = 'en' | 'vi';
export type Translations = typeof en;

export const languages: Record<Language, Translations> = { en, vi };

export const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
}>({
  lang: 'en',
  setLang: () => {},
  t: en,
});

export const useTranslation = () => useContext(LanguageContext);
