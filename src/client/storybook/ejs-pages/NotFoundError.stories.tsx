import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import notFoundErrorTemplate from '../../../server/views/404.error.ejs'
import partialMastheadTemplate from '../../../server/views/partial-masthead.ejs'
import { publicViewportParameters } from '../decorators'
import EjsPage from '../EjsPage'

// Rendered server-side by RedirectController.redirect() (src/server/modules/
// redirect/RedirectController.ts) whenever a short link doesn't resolve to
// any real long URL. No login involved. Distinct from the React SPA's
// Public/NotFound story (src/client/app/components/pages/NotFoundPage) --
// this one fires on the server before the SPA is ever loaded.
const meta: Meta = {
  title: 'Server Pages/Short Link 404',
  parameters: publicViewportParameters,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <EjsPage
      template={notFoundErrorTemplate}
      includes={{ 'partial-masthead': partialMastheadTemplate }}
      data={{
        shortUrl: 'invalid-link',
        assetVariant: 'gov',
        displayHostname: 'Go.gov.sg',
      }}
    />
  ),
}
