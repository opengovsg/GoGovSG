import type { Preview } from '@storybook/react'
import type { ViewportMap } from 'storybook/viewport'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import {
  withRedux,
  withRouter,
  withTheme,
} from '../src/client/storybook/decorators'
import govTranslation from '../public/locales/gov/en/translation.json'

// The app initialises i18next via an HTTP backend (src/client/app/i18n.ts)
// that fetches /locales/<variant>/<lng>/<ns>.json at runtime. Stories never
// run that bootstrap, so i18next.t() calls return undefined -- harmless on
// their own, but a crash wherever a component chains a string method (e.g.
// StatisticsSliver.tsx's `.toUpperCase()`) onto the result. Initialising
// synchronously with the real gov-variant resource file (no HTTP round
// trip needed) makes every i18next.t() call resolve exactly as it does in
// production for the gov variant.
i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en'],
  resources: { en: { translation: govTranslation } },
  interpolation: { escapeValue: false },
})

// Matches the app theme's breakpoints (src/client/app/theme/index.ts:
// sm=600, md=960, xl=1440), with desktop pinned to 1280 (lg) per the agreed
// viewport policy.
const CUSTOM_VIEWPORTS: ViewportMap = {
  mobile: {
    name: 'Mobile (375)',
    styles: { width: '375px', height: '812px' },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet (960)',
    styles: { width: '960px', height: '1024px' },
    type: 'tablet',
  },
  desktop: {
    name: 'Desktop (1280)',
    styles: { width: '1280px', height: '800px' },
    type: 'desktop',
  },
}

const preview: Preview = {
  decorators: [withTheme, withRouter, withRedux],
  parameters: {
    viewport: { options: CUSTOM_VIEWPORTS },
  },
}

export default preview
