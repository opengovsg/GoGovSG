export type State = {
  controlPanelIsOpen: boolean
  controlPanelData?: Row
}

export const initialState: State = {
  controlPanelIsOpen: false,
}

export type Row = {
  userId: number
  isFile: boolean
  state: string
  shortUrl: string
  longUrl: string
  editedLongUrl: string
  createdAt: string
  updatedAt: string
  clicks: number
  [key: string]: any
}

export type Action = {
  type: string
  payload?: Row
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
      newState.controlPanelData = action.payload
      break
    case ModalActions.closeControlPanel:
      newState.controlPanelIsOpen = false
      newState.controlPanelData = undefined
      break
    default:
      throw new Error(`Undefined modal action: ${action.type}`)
  }
  return { ...state, ...newState }
}

export default ModalActions
