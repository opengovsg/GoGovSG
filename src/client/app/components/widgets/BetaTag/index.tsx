import React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      fontWeight: 400,
      background: theme.palette.secondary.main,
      borderRadius: '5px',
      color: 'white',
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(0.5),
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      [theme.breakpoints.up('md')]: {
        fontWeight: 500,
      },
    },
    text: {
      fontSize: '0.75rem',
    },
  }),
)

const BetaTag = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Typography variant="body2" className={classes.text}>
        BETA
      </Typography>
    </div>
  )
}

export default BetaTag
