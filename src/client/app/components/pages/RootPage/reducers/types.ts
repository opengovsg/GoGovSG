import { ReactNode } from 'react'

export type RootState = {
  snackbarMessage: {
    message: ReactNode
    variant: number
  }
}
