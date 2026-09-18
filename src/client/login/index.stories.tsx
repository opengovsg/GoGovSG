import type { Meta, StoryObj } from '@storybook/react'

import { publicViewportParameters } from '../storybook/decorators'
import { loginFormVariants } from '../app/util/types'
import LoginPage from './index'

const meta: Meta<typeof LoginPage> = {
  title: 'Public/Login',
  component: LoginPage,
  parameters: publicViewportParameters,
}

export default meta
type Story = StoryObj<typeof LoginPage>

export const EmailEntry: Story = {
  parameters: {
    ...publicViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: false,
        formVariant: loginFormVariants.types.EMAIL_READY,
      },
    },
  },
}

export const OtpEntry: Story = {
  parameters: {
    ...publicViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: false,
        formVariant: loginFormVariants.types.OTP_READY,
        email: 'officer@open.gov.sg',
      },
    },
  },
}
