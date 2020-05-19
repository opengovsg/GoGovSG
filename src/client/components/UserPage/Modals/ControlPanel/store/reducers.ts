export type State = {
  controlPanelIsOpen: boolean
  relevantShortLink?: string
}

export const initialState: State = {
  controlPanelIsOpen: false,
}

export type Action = {
  type: string
  payload?: string
}

export const ModalActions = {
  openControlPanel: 'OPEN_CONTROL_PANEL',
  closeControlPanel: 'CLOSE_CONTROL_PANEL',
}

export function modalReducer(state: State, action: Action) {
  const newState: Partial<State> = {}

  switch (action.type) {
    case ModalActions.openControlPanel:
      newState.controlPanelIsOpen = true
      newState.relevantShortLink = action.payload
      break
    case ModalActions.closeControlPanel:
      newState.controlPanelIsOpen = false
      newState.relevantShortLink = undefined
      break
    default:
      throw new Error(`Undefined modal action: ${action.type}`)
  }
  return { ...state, ...newState }
}

export default ModalActions
