import React from 'react'
import { Button, Typography, createStyles, makeStyles } from '@material-ui/core'

import historyIcon from './assets/history-icon.svg'

const useStyles = makeStyles(() =>
  createStyles({
    rootDiv: {
      display: 'block',
      textAlign: 'right',
    },
  }),
)
export default function LinkHistoryButton() {
  const classes = useStyles()

  return (
    <div className={classes.rootDiv}>
      <Button
        // TODO
        onClick={() => console.log('Pending OnClick implementation')}
        size="large"
        variant="text"
      >
        <Typography variant="body2" color="primary">
          View Link History
        </Typography>
        <img src={historyIcon} alt="View Link History Icon" />
      </Button>
    </div>
  )
}
