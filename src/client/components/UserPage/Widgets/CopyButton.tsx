import React from 'react'
import copy from 'copy-to-clipboard'
import { Button, Typography, makeStyles, createStyles } from '@material-ui/core'

import copyIcon from '../assets/copy-icon.svg'
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
  buttonText: string
  iconSize: number
  variant?:
    | 'button'
    | 'caption'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'inherit'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
    | 'overline'
    | 'srOnly'
    | undefined
  stopPropagation?: boolean
}

export default function CopyButton(props: CopyButtonProps) {
  const classes = useStyles({ iconSize: props.iconSize })
  return (
    <OnClickTooltip tooltipText="Short link copied">
      <Button
        onClick={(e) => {
          const urlToCopy = `${document.location.protocol}//${document.location.host}/${props.shortUrl}`
          copy(urlToCopy)
          if (props.stopPropagation) {
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
          <Typography variant={props.variant || 'subtitle2'}>
            {props.buttonText}
          </Typography>
        </div>
      </Button>
    </OnClickTooltip>
  )
}
