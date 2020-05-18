export type State = {
  controlPanelIsOpen: boolean
}

export const initialState: State = {
  controlPanelIsOpen: true,
}

export type Action = {
  type: string
  payload?: unknown
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
      break
    case ModalActions.closeControlPanel:
      newState.controlPanelIsOpen = false
      break
    default:
      throw new Error(`Undefined modal action: ${action.type}`)
  }
  return { ...state, ...newState }
}

export default ModalActions
