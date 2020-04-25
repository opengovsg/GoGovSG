import React from 'react'
import PropTypes from 'prop-types'
import 'boxicons'
import { CssBaseline, createStyles, makeStyles } from '@material-ui/core'
import Masthead from './Masthead'
import BaseLayoutHeader from './BaseLayoutHeader'
import BaseLayoutFooter from './BaseLayoutFooter'

export const fetchAppMargins = (theme, multiplier = 1) => {
  return {
    marginLeft: theme.spacing(4 * multiplier),
    marginRight: theme.spacing(4 * multiplier),
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(6 * multiplier),
      marginRight: theme.spacing(6 * multiplier),
    },
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(8 * multiplier),
      marginRight: theme.spacing(8 * multiplier),
    },
    [theme.breakpoints.up('lg')]: {
      marginLeft: theme.spacing(12 * multiplier),
      marginRight: theme.spacing(12 * multiplier),
    },
  }
}

const useStyles = makeStyles(() =>
  createStyles({
    '@global': {
      body: {
        display: 'flex',
        backgroundColor: 'transparent',
        '& #root': {
          flexGrow: 1,
          '-ms-flex': '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: '100vh',
        },
      },
      a: {
        textDecoration: 'none',
      },
    },
    layout: {
      flexGrow: 1,
      '-ms-flex': '1 1 auto',
    },
  }),
)

const BaseLayout = ({ withHeader, withFooter, children }) => {
  const classes = useStyles()
  return (
    <>
      <CssBaseline />
      <Masthead />
      {withHeader && <BaseLayoutHeader />}
      <div className={classes.layout}>{children}</div>
      {withFooter && <BaseLayoutFooter />}
    </>
  )
}

BaseLayout.propTypes = {
  withHeader: PropTypes.bool,
  withFooter: PropTypes.bool,
}

BaseLayout.defaultProps = {
  withHeader: true,
  withFooter: true,
}

export default BaseLayout
