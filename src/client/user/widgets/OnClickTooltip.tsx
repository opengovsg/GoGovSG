import React, { useState } from 'react'
import { Tooltip } from '@material-ui/core'

type OnClickTooltipType = {
  tooltipText: string
  children: React.ReactElement
}

export default function OnClickTooltip({
  tooltipText,
  children,
}: OnClickTooltipType) {
  const [open, setOpen] = useState<boolean>(false)
  const handleTooltipOpen = () => setOpen(true)
  const handleTooltipClose = () => setOpen(false)

  return (
    <Tooltip
      PopperProps={{
        disablePortal: true,
      }}
      title={tooltipText}
      open={open}
      onClickCapture={handleTooltipOpen}
      onClose={handleTooltipClose}
      placement="top"
      arrow
    >
      {children}
    </Tooltip>
  )
}
