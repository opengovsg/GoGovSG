import type { Meta, StoryObj } from '@storybook/react'

import { adminViewportParameters } from '../storybook/decorators'
import ApiIntegrationPage from './index'

const meta: Meta<typeof ApiIntegrationPage> = {
  title: 'Admin/API Integration',
  component: ApiIntegrationPage,
  parameters: adminViewportParameters,
}

export default meta
type Story = StoryObj<typeof ApiIntegrationPage>

export const NoApiKey: Story = {
  parameters: {
    ...adminViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: true,
      },
      api: {
        hasApiKey: false,
      },
    },
  },
}

export const ApiKeyGenerated: Story = {
  parameters: {
    ...adminViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: true,
      },
      api: {
        hasApiKey: true,
        apiKeyModal: true,
        apiKey: 'test_v1_R4nd0mB4se64Enc0dedApiKeyStr1ngExample1234==',
      },
    },
  },
}
