import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import 'boxicons'
import { CssBaseline, createStyles, makeStyles } from '@material-ui/core'
import Masthead from '~/components/Masthead'
import BaseLayoutHeader from './BaseLayoutHeader'
import BaseLayoutFooter from './BaseLayoutFooter'
import SectionBackground from '../SectionBackground'

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

const useStyles = makeStyles((theme) =>
  createStyles({
    '@global': {
      body: {
        backgroundColor: '#fff',
        '& #root': {
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
    appContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 28px)',
      ...fetchAppMargins(theme),
    },
    ignoreAppMarginsContainer: {
      ...fetchAppMargins(theme, -1),
    },
    layout: {
      flexGrow: 1,
    },
  }),
)

const BaseLayout = ({ withAppMargins, withHeader, withFooter, children }) => {
  const classes = useStyles()
  return (
    <>
      <CssBaseline />
      <Masthead />
      <section className={withAppMargins ? classes.appContainer : ''}>
        {withHeader && <BaseLayoutHeader />}
        <span className={classes.layout}>{children}</span>
        {withFooter && (
          <SectionBackground backgroundType="dark">
            <BaseLayoutFooter />
          </SectionBackground>
        )}
      </section>
    </>
  )
}

BaseLayout.propTypes = {
  withAppMargins: PropTypes.bool,
  withHeader: PropTypes.bool,
  withFooter: PropTypes.bool,
}

BaseLayout.defaultProps = {
  withAppMargins: true,
  withHeader: true,
  withFooter: true,
}

export const IgnoreAppMargins = ({ className, children }) => {
  const classes = useStyles()
  return (
    <span className={classNames(className, classes.ignoreAppMarginsContainer)}>
      {children}
    </span>
  )
}

export default BaseLayout
