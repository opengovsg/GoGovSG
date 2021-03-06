import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

const assetVariant = process.env.ASSET_VARIANT || 'gov'

const pathVariant =
  assetVariant === 'edu'
    ? '/locales/edu/{{lng}}/{{ns}}.json'
    : '/locales/gov/{{lng}}/{{ns}}.json'

export const i18nInit = i18next
  // load translation using http -> see /public/locales
  .use(Backend)
  .use(initReactI18next) // Passes i18n down to react-i18next.
  .init({
    // debug: true, // For verbose logging in development.
    backend: {
      loadPath: pathVariant,
    },
    lng: 'en',
    fallbackLng: 'en',
    whitelist: ['en'],
    interpolation: {
      escapeValue: false, // React already safes from xss.
    },
    initImmediate: false,
  })

export default i18next
