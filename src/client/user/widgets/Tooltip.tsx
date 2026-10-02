import React, { FunctionComponent } from 'react'
import { Tooltip as MuiTooltip } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

import helpIcon from '@assets/shared/help-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    tooltip: {
      whiteSpace: 'nowrap',
      maxWidth: 'unset',
      [theme.breakpoints.up('md')]: {
        marginTop: '-12px',
        padding: '16px',
      },
    },
    ownershipHelpIcon: {
      width: '14px',
      verticalAlign: 'middle',
    },
  }),
)

type TooltipProps = {
  title: string
  imageAltText: string
}

const Tooltip: FunctionComponent<TooltipProps> = ({
  title,
  imageAltText,
}: TooltipProps) => {
  const classes = useStyles()

  return (
    <MuiTooltip
      title={title}
      arrow
      placement="top"
      classes={{ tooltip: classes.tooltip }}
    >
      <img
        className={classes.ownershipHelpIcon}
        src={helpIcon}
        alt={imageAltText}
        draggable={false}
      />
    </MuiTooltip>
  )
}

export default Tooltip
