import React from 'react'
import copy from 'copy-to-clipboard'
import { Button, Typography, TypographyVariant } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

import copyIcon from '@assets/widgets/user/copy-icon.svg'
import OnClickTooltip from './OnClickTooltip'

type StyleProps = {
  iconSize: number
}

const useStyles = makeStyles(() =>
  createStyles({
    copyLinkDiv: {
      display: 'flex',
    },
    copyIcon: {
      marginRight: 5,
      width: (props: StyleProps) => props.iconSize,
    },
  }),
)

export type CopyButtonProps = {
  shortUrl: string
  buttonText?: string // if omitted, defaults to the url to copy
  iconSize: number
  variant?: TypographyVariant
  stopPropagation?: boolean
}

export default function CopyButton({
  iconSize,
  buttonText,
  shortUrl,
  stopPropagation,
  variant,
}: CopyButtonProps) {
  const classes = useStyles({ iconSize })
  const urlToCopy = `${document.location.protocol}//${document.location.host}/${shortUrl}`

  return (
    <OnClickTooltip tooltipText="Short link copied">
      <Button
        onClick={(e) => {
          copy(urlToCopy)
          if (stopPropagation) {
            e.stopPropagation()
          }
        }}
      >
        <div className={classes.copyLinkDiv}>
          <img
            className={classes.copyIcon}
            src={copyIcon}
            alt="Copy short link"
          />
          <Typography variant={variant || 'subtitle2'}>
            {buttonText || urlToCopy}
          </Typography>
        </div>
      </Button>
    </OnClickTooltip>
  )
}
