import React from 'react'
import { Button, Typography, useTheme } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import HistoryIcon from '../widgets/HistoryIcon'

const useStyles = makeStyles(() =>
  createStyles({
    rootDiv: {
      display: 'block',
      textAlign: 'right',
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
  const theme = useTheme()

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
        <HistoryIcon color={theme.palette.primary.main} />
      </Button>
    </div>
  )
}
