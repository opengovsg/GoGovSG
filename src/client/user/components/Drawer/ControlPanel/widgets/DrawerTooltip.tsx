import React, { FunctionComponent } from 'react'
import { Tooltip, createStyles, makeStyles } from '@material-ui/core'

import helpIcon from '../../../../../app/assets/help-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    drawerTooltip: {
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

type DrawerTooltipProps = {
  title: string
  imageAltText: string
}

const DrawerTooltip: FunctionComponent<DrawerTooltipProps> = ({
  title,
  imageAltText,
}: DrawerTooltipProps) => {
  const classes = useStyles()

  return (
    <Tooltip
      title={title}
      arrow
      placement="top"
      classes={{ tooltip: classes.drawerTooltip }}
    >
      <img
        className={classes.ownershipHelpIcon}
        src={helpIcon}
        alt={imageAltText}
        draggable={false}
      />
    </Tooltip>
  )
}

export default DrawerTooltip
