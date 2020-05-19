import React, { createContext, useReducer, useContext } from 'react'
import CreateUrlModal from './CreateUrlModal'
import ControlPanel from './ControlPanel'
import { Action, State, initialState, modalReducer } from './ControlPanel/helpers/reducers'

export { CreateUrlModal }

function useDialogController() {
  const [state, dispatch] = useReducer(modalReducer, initialState)
  return { state, dispatch }
}

export function useModalState() {
  const { state } = useContext(ModalContext)
  if (state === undefined) {
    throw new Error(
      'useModalState must be used within a Modal wrapper component',
    )
  }
  return state
}

export function useModalDispatch() {
  const { dispatch } = useContext(ModalContext)
  if (dispatch === undefined) {
    throw new Error(
      'useModalDispatch must be used within a Modal wrapper component',
    )
  }
  return dispatch
}

type ModalContextType = {
  state: State
  dispatch?: (action: Action) => void
}

// Used to inject and retrieve modal state and dispatcher.
export const ModalContext = createContext<ModalContextType>({
  state: initialState,
})
export const ModalProvider = ModalContext.Provider
export const ModalConsumer = ModalContext.Consumer

type ModalProps = {
  children: React.ReactNode
}

// Wraps modals around children components on user page.
export default function Modals({ children }: ModalProps) {
  const { state, dispatch } = useDialogController()
  return (
    <ModalProvider value={{ state, dispatch }}>
      <ControlPanel />
      {children}
    </ModalProvider>
  )
}
