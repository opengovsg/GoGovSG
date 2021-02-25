import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core'

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
    width: '70%',
    [theme.breakpoints.up('sm')]: {
      width: '100%',
    },
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
  subtitle?: React.ReactNode
}

export default function BaseStatisticsLayout({
  children,
  title,
  subtitle,
}: BaseStatisticsLayoutProps) {
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('xs'))
  return (
    <div className={classes.root}>
      <Typography
        color="primary"
        variant={isMobileView ? 'h6' : 'h4'}
        className={classes.title}
      >
        {title}
      </Typography>
      {subtitle}
      <div className={classes.divider} />
      {children}
    </div>
  )
}
