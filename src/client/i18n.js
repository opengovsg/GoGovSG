import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationEn from './locale/en/translation'

i18next
  .use(initReactI18next) // Passes i18n down to react-i18next.
  .init({
    resources: {
      en: {
        translation: translationEn,
      },
    },
    // debug: true, // For verbose logging in development.
    lng: 'en',
    fallbackLng: 'en',
    whitelist: ['en'],
    interpolation: {
      escapeValue: false, // React already safes from xss.
    },
  })

export default i18next
