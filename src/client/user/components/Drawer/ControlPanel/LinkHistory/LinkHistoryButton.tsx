import React from 'react'
import {
  Button,
  Typography,
  createStyles,
  makeStyles,
  useTheme,
} from '@material-ui/core'
import HistoryIcon from '../assets/HistoryIcon'

const useStyles = makeStyles(() =>
  createStyles({
    rootDiv: {
      display: 'block',
      textAlign: 'right',
      // [theme.breakpoints.down('sm')]: {
      //   // textAlign: 'left',
      // },
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
