import type { Meta, StoryObj } from '@storybook/react'

import { publicViewportParameters } from '../storybook/decorators'
import HomePage from './index'

const meta: Meta<typeof HomePage> = {
  title: 'Public/Home',
  component: HomePage,
  parameters: publicViewportParameters,
}

export default meta
type Story = StoryObj<typeof HomePage>

export const Default: Story = {
  parameters: {
    ...publicViewportParameters,
    reduxState: {},
  },
}
