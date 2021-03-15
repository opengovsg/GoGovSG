import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

declare let ASSET_VARIANT: string
const assetVariant = ASSET_VARIANT || 'gov'

const pathVariant =
  assetVariant === 'edu'
    ? '/edu/locales/{{lng}}/{{ns}}.json'
    : '/gov/locales/{{lng}}/{{ns}}.json'

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
