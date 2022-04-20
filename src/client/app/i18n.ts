import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
import assetVariant from '../../shared/util/asset-variant'

const pathVariant = `/locales/${assetVariant}/{{lng}}/{{ns}}.json`

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
