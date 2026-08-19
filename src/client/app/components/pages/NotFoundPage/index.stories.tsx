import type { Meta, StoryObj } from '@storybook/react'

import { publicViewportParameters } from '../../../../storybook/decorators'
import NotFoundPage from './index'

const meta: Meta<typeof NotFoundPage> = {
  title: 'Public/NotFound',
  component: NotFoundPage,
  parameters: publicViewportParameters,
}

export default meta
type Story = StoryObj<typeof NotFoundPage>

export const Default: Story = {
  args: {
    // NotFoundPage receives `match` as a prop (injected by react-router's
    // <Route component={NotFoundPage} /> in RootPage) rather than reading it
    // via useParams, so it's supplied directly here instead of via
    // routerEntries. NotFoundPageProps types shortUrl as boolean, but the
    // real route param is always a string -- cast to match the existing
    // (pre-existing, unrelated) prop type.
    match: {
      params: {
        shortUrl: 'go-example' as unknown as boolean,
      },
    },
  },
  parameters: {
    ...publicViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: false,
      },
    },
  },
}
