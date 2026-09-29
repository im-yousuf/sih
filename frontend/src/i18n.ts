/**
 * i18n configuration
 *
 * Supported locales:
 *   en  — English          (default / fallback)
 *   hi  — Hindi            (हिंदी)
 *   as  — Assamese         (অসমীয়া)
 *   te  — Telugu           (తెలుగు)
 *   raj — Rajasthani       (राजस्थानी)
 *
 * Detection order: localStorage → navigator.language → 'en'
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en  from './locales/en/translation.json';
import hi  from './locales/hi/translation.json';
import as_ from './locales/as/translation.json';
import te  from './locales/te/translation.json';
import raj from './locales/raj/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en:  { translation: en  },
      hi:  { translation: hi  },
      as:  { translation: as_ },
      te:  { translation: te  },
      raj: { translation: raj },
    },
    fallbackLng: 'en',
    // detection order: localStorage key 'i18nextLng' → browser language
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes output
    },
  });

export default i18n;

// Human-readable labels for the language switcher
export const LANGUAGES = [
  { code: 'en',  label: 'EN',  full: 'English'     },
  { code: 'hi',  label: 'HI',  full: 'हिंदी'       },
  { code: 'as',  label: 'AS',  full: 'অসমীয়া'      },
  { code: 'te',  label: 'TE',  full: 'తెలుగు'       },
  { code: 'raj', label: 'RAJ', full: 'राजस्थानी'   },
] as const;
