import * as React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'box-icon': Partial<BoxIconProps>
    }
  }
}

interface BoxIconProps {
  size: string
  name: string
  color: string
}
