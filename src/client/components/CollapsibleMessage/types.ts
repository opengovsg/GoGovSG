export enum CollapsibleMessageType {
  Error,
  Success,
}

export type CollapsibleMessageProps = {
  type: CollapsibleMessageType
  visible: boolean
  position?: CollapsibleMessagePosition
}

export type CollapsibleMessageStyles = {
  type: CollapsibleMessageType
  position: CollapsibleMessagePosition
}

export enum CollapsibleMessagePosition {
  Static = 'static',
  Absolute = 'absolute',
}
