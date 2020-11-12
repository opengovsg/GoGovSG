import { CollapseProps } from '@material-ui/core'

export enum CollapsibleMessageType {
  Error,
  Success,
}

export enum CollapsibleMessagePosition {
  Static = 'static',
  Absolute = 'absolute',
}

export type CollapsibleMessageProps = {
  type: CollapsibleMessageType
  visible: boolean
  position?: CollapsibleMessagePosition
} & Pick<CollapseProps, 'timeout'>

export type CollapsibleMessageStyles = {
  type: CollapsibleMessageType
  position: CollapsibleMessagePosition
}
