export type State = {
  controlPanelIsOpen: boolean
  relevantShortLink: string | null
  qrCodeModalIsOpen: boolean
  uploadFileError: string | null
  linkHistoryIsActive: boolean
}

export const initialState: State = {
  controlPanelIsOpen: false,
  relevantShortLink: null,
  qrCodeModalIsOpen: false,
  uploadFileError: null,
  linkHistoryIsActive: false,
}

export type Action = {
  type: string
  payload?: string | null
}

export const DrawerActions = {
  openControlPanel: 'OPEN_CONTROL_PANEL',
  closeControlPanel: 'CLOSE_CONTROL_PANEL',
  openQrCodeModal: 'OPEN_QR_CODE_MODAL',
  closeQrCodeModal: 'CLOSE_QR_CODE_MODAL',
  setUploadFileError: 'SET_UPLOAD_FILE_ERROR',
  activateLinkHistory: 'TOGGLE_LINK_HISTORY',
}

export function drawerReducer(state: State, action: Action) {
  const newState: Partial<State> = {}

  switch (action.type) {
    case DrawerActions.openControlPanel:
      newState.controlPanelIsOpen = true
      newState.relevantShortLink = action.payload
      break
    case DrawerActions.closeControlPanel:
      newState.linkHistoryIsActive = false
      newState.controlPanelIsOpen = false
      newState.relevantShortLink = null
      break
    case DrawerActions.openQrCodeModal:
      newState.qrCodeModalIsOpen = true
      break
    case DrawerActions.closeQrCodeModal:
      newState.qrCodeModalIsOpen = false
      break
    case DrawerActions.setUploadFileError:
      newState.uploadFileError = action.payload
      break
    case DrawerActions.activateLinkHistory:
      newState.linkHistoryIsActive = !state.linkHistoryIsActive
      break
    default:
      throw new Error(`Undefined modal action: ${action.type}`)
  }
  return { ...state, ...newState }
}

export default DrawerActions
