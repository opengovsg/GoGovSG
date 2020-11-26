import React from 'react'
import { Typography, makeStyles, createStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      fontWeight: 400,
      background: '#8CA6AD',
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
