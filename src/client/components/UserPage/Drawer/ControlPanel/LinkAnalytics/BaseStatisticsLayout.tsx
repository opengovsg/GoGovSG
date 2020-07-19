import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
  root: {
    border: 'solid 1px #CDDCE0',
    borderRadius: 3,
    paddingTop: 34,
    paddingBottom: 34,
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 16,
    '&last-child': {
      marginBottom: 0,
    },
    [theme.breakpoints.up('sm')]: {
      paddingTop: 48,
      paddingBottom: 32,
      paddingLeft: 40,
      paddingRight: 40,
    },
  },
  title: {
    width: '70%',
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
      <Typography color="primary" variant="h6" className={classes.title}>
        {props.title}
      </Typography>
      <Divider className={classes.divider} />
      {props.children}
    </div>
  )
}
