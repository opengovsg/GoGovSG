import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import serverErrorTemplate from '../../../server/views/500.error.ejs'
import { publicViewportParameters } from '../decorators'
import EjsPage from '../EjsPage'

// Rendered by the generic Express error handler (src/server/index.ts) on
// any unhandled 500. No login involved, no template variables, no includes
// -- the simplest of the server-rendered pages.
const meta: Meta = {
  title: 'Server Pages/Internal Error 500',
  parameters: publicViewportParameters,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <EjsPage template={serverErrorTemplate} />,
}
