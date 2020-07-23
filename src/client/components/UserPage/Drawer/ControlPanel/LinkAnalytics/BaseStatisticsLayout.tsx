import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingLeft: 16,
    paddingRight: 16,
    [theme.breakpoints.up('sm')]: {
      paddingTop: 49,
      paddingBottom: 35,
      paddingLeft: 40,
      paddingRight: 40,
    },
  },
  title: {
    width: '100%',
  },
  divider: {
    marginTop: 15,
    marginBottom: 30,
    marginLeft: -16,
    marginRight: -16,
    [theme.breakpoints.up('sm')]: {
      paddingLeft: -40,
      paddingRight: -40,
    },
  },
}))

export type BaseStatisticsLayoutProps = {
  children: React.ReactNode
  title: string
}

export default function BaseStatisticsLayout(props: BaseStatisticsLayoutProps) {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Typography color="primary" variant="h4" className={classes.title}>
        {props.title}
      </Typography>
      <div className={classes.divider} />
      {props.children}
    </div>
  )
}
