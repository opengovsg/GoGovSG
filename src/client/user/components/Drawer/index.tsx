import React, { createContext, useContext, useReducer } from 'react'
import ControlPanel from './ControlPanel'
import {
  Action,
  State,
  drawerReducer,
  initialState,
} from './ControlPanel/util/reducers'

function useDrawerController() {
  const [state, dispatch] = useReducer(drawerReducer, initialState)
  return { state, dispatch }
}

export function useDrawerState() {
  const { state } = useContext(DrawerContext)
  if (state === undefined) {
    throw new Error(
      'useDrawerState must be used within a Drawer wrapper component',
    )
  }
  return state
}

export function useDrawerDispatch() {
  const { dispatch } = useContext(DrawerContext)
  if (dispatch === undefined) {
    throw new Error(
      'useDrawerDispatch must be used within a Drawer wrapper component',
    )
  }
  return dispatch
}

type DrawerContextType = {
  state: State
  dispatch?: (action: Action) => void
}

// Used to inject and retrieve drawer state and dispatcher.
export const DrawerContext = createContext<DrawerContextType>({
  state: initialState,
})
export const DrawerProvider = DrawerContext.Provider
export const DrawerConsumer = DrawerContext.Consumer

type DrawerProps = {
  children: React.ReactNode
}

// Wraps drawer around children components on user page.
export default function Drawer({ children }: DrawerProps) {
  const { state, dispatch } = useDrawerController()
  return (
    <DrawerProvider value={{ state, dispatch }}>
      <ControlPanel />
      {children}
    </DrawerProvider>
  )
}
