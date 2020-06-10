import React, { useState } from 'react'
import { Tooltip } from '@material-ui/core'

type OnClickTooltipType = {
  tooltipText: string
  children: React.ReactElement
}

export default function OnClickTooltip(props: OnClickTooltipType) {
  const [open, setOpen] = useState<boolean>(false)
  const handleTooltipOpen = () => setOpen(true)
  const handleTooltipClose = () => setOpen(false)

  return (
    <Tooltip
      PopperProps={{
        disablePortal: true,
      }}
      title={props.tooltipText}
      open={open}
      onClickCapture={handleTooltipOpen}
      onClose={handleTooltipClose}
      placement="top"
      arrow
    >
      {props.children}
    </Tooltip>
  )
}
