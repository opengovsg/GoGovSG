export type State = {
  controlPanelIsOpen: boolean
  relevantShortLink?: string
  qrCodeModalIsOpen: boolean
}

export const initialState: State = {
  controlPanelIsOpen: false,
  qrCodeModalIsOpen: false,
}

export type Action = {
  type: string
  payload?: string
}

export const ModalActions = {
  openControlPanel: 'OPEN_CONTROL_PANEL',
  closeControlPanel: 'CLOSE_CONTROL_PANEL',
  openQrCodeModal: 'OPEN_QR_CODE_MODAL',
  closeQrCodeModal: 'CLOSE_QR_CODE_MODAL',
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
    case ModalActions.openQrCodeModal:
      newState.qrCodeModalIsOpen = true
      break
    case ModalActions.closeQrCodeModal:
      newState.qrCodeModalIsOpen = false
      break
    default:
      throw new Error(`Undefined modal action: ${action.type}`)
  }
  return { ...state, ...newState }
}

export default ModalActions
