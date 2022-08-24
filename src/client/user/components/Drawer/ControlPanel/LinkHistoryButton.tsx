import React from 'react'
import { Button, Typography, createStyles, makeStyles } from '@material-ui/core'

import historyIcon from './assets/history-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    rootDiv: {
      display: 'block',
      textAlign: 'right',
      [theme.breakpoints.down('sm')]: {
        textAlign: 'left',
      },
    },
    linkButton: {
      padding: 0,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  }),
)

type LinkHistoryButtonProps = {
  clickHandler: () => void
}

export default function LinkHistoryButton({
  clickHandler,
}: LinkHistoryButtonProps) {
  const classes = useStyles()

  return (
    <div className={classes.rootDiv}>
      <Button
        className={classes.linkButton}
        onClick={clickHandler}
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
