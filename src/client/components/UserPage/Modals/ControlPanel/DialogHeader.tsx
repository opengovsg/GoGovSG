import React from 'react'
import {
  Typography,
  createStyles,
  makeStyles,
  Button,
} from '@material-ui/core'

import copyIcon from './assets/copy-icon.svg'
import copy from 'copy-to-clipboard'
import { useModalState } from '..'
import OnClickTooltip from './widgets/OnClickTooltip'

const useStyles = makeStyles(() =>
  createStyles({
    dialogTitleDiv: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 44,
    },
    copyLinkDiv: {
      display: 'flex',
    },
    copyIcon: {
      marginRight: 5,
    },
  }),
)

export default function DialogHeader() {
  const classes = useStyles()
  const shortUrl = useModalState().controlPanelData?.shortUrl

  return (
    <div className={classes.dialogTitleDiv}>
      <Typography variant="h3" color="primary">
        Edit link
      </Typography>
      <OnClickTooltip tooltipText="Short link copied">
        <Button
          onClick={() =>
            copy(
              `${document.location.protocol}//${document.location.host}/${shortUrl}`,
            )
          }
        >
          <div className={classes.copyLinkDiv}>
            <img
              className={classes.copyIcon}
              src={copyIcon}
              alt="Copy short link"
            />
            <Typography variant="subtitle2">Copy short link</Typography>
          </div>
        </Button>
      </OnClickTooltip>
    </div>
  )
}
