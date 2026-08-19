import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import transitionPageTemplate from '../../../server/views/transition-page.ejs'
import partialMastheadTemplate from '../../../server/views/partial-masthead.ejs'
import { publicViewportParameters } from '../decorators'
import EjsPage from '../EjsPage'

// Rendered server-side by RedirectController.redirect() (src/server/modules/
// redirect/RedirectController.ts) whenever a short link resolves to a real
// long URL -- the "Check your address bar" phishing-warning interstitial
// shown before redirecting. No login involved: this is the single most
// heavily-trafficked public page in the app, hit on every short-link click.
const meta: Meta = {
  title: 'Server Pages/Redirect Transition',
  parameters: publicViewportParameters,
}

export default meta
type Story = StoryObj

// Two known, pre-existing 404s in this render, unrelated to Storybook setup:
// - /assets/lion-head-symbol.svg -- bundled by the CLIENT production
//   webpack build (assetModuleFilename: 'assets/[name][ext]'), which
//   Storybook doesn't run. Cosmetic-only masthead icon, low regression risk.
// - /assets/transition-page/js/redirect.js -- referenced by the real
//   template but does not exist anywhere in this repo. Not introduced by
//   this change; worth a separate look at whether it's served from outside
//   this repo or the page's countdown/skip-ahead behaviour is actually
//   broken in production.
export const Default: Story = {
  render: () => (
    <EjsPage
      template={transitionPageTemplate}
      includes={{ 'partial-masthead': partialMastheadTemplate }}
      data={{
        escapedLongUrl: 'https://www.moh.gov.sg/covid-19/vaccination',
        rootDomain: 'moh.gov.sg',
        gaTrackingId: 'UA-00000000-0',
        assetVariant: 'gov',
        displayHostname: 'Go.gov.sg',
      }}
    />
  ),
}
