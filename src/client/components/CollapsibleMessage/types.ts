export type CollapsibleMessageType = 'error' | 'success'

export type CollapsibleMessageProps = {
  type: CollapsibleMessageType
  visible: boolean
  message: string
}

export type CollapsibleMessageStyles = {
  type: CollapsibleMessageType
}
