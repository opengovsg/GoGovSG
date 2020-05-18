import React from 'react'
import { Typography, createStyles, makeStyles, Button } from '@material-ui/core'

import copyIcon from './assets/copy-icon.svg'

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

  return (
    <div className={classes.dialogTitleDiv}>
      <Typography variant="h2" color="primary">
        Edit link
      </Typography>
      <Button>
        <div className={classes.copyLinkDiv}>
          <img
            className={classes.copyIcon}
            src={copyIcon}
            alt="Copy short link"
          />
          <Typography variant="subtitle2">Copy short link</Typography>
        </div>
      </Button>
    </div>
  )
}
