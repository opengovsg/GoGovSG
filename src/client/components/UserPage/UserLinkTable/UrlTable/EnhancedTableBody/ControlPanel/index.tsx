import React, { useState } from 'react'
import { Dialog } from '@material-ui/core'

export const useControlPanel = () => {
  const [open, setOpen] = useState<boolean>(false)
  return { open, setOpen }
}

type ControlPanelProps = {
  open: boolean
  [key: string]: any
}

export default function ControlPanel({ open }: ControlPanelProps) {
  return <Dialog open={open}></Dialog>
}
