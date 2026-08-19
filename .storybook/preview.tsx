import type { Preview } from '@storybook/react'
import type { ViewportMap } from 'storybook/viewport'

import {
  withRedux,
  withRouter,
  withTheme,
} from '../src/client/storybook/decorators'

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
