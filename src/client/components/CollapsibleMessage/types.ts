export enum CollapsibleMessageType {
  Error,
  Success,
}

export type CollapsibleMessageProps = {
  type: CollapsibleMessageType
  visible: boolean
  message: string
}

export type CollapsibleMessageStyles = {
  type: CollapsibleMessageType
}
