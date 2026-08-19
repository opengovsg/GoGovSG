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

// One known, pre-existing 404 in this render, unrelated to Storybook setup:
// /assets/transition-page/js/redirect.js is referenced by the real template
// but does not exist anywhere in this repo. Not introduced by this change;
// worth a separate look at whether it's served from outside this repo or
// the page's countdown/skip-ahead behaviour is actually broken in
// production. (The masthead's lion-head-symbol.svg icon, previously also
// missing here, is now served via the staticDirs mapping in
// .storybook/main.ts.)
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
