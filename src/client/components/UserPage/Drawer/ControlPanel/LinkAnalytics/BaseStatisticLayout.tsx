import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(() => ({
  root: {
    border: 'solid 1px #CDDCE0',
    borderRadius: 3,
    paddingTop: 48,
    paddingBottom: 60,
    paddingLeft: 40,
    paddingRight: 40,
    marginBottom: 10,
    '&last-child': {
      marginBottom: 0,
    },
  },
  divider: {
    marginTop: 23,
    marginBottom: 32,
    marginLeft: -40,
    marginRight: -40,
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
      <Typography color="primary" variant="h4">
        {props.title}
      </Typography>
      <Divider className={classes.divider} />
      {props.children}
    </div>
  )
}
