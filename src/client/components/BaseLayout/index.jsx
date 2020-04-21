import React from 'react'
import PropTypes from 'prop-types'
import 'boxicons'
import { CssBaseline, createStyles, makeStyles } from '@material-ui/core'
import Masthead from '~/components/Masthead'
import BaseLayoutHeader from './BaseLayoutHeader'
import BaseLayoutFooter from './BaseLayoutFooter'
import SectionBackground from '../SectionBackground'

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
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(6),
        marginRight: theme.spacing(6),
      },
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(8),
        marginRight: theme.spacing(8),
      },
      [theme.breakpoints.up('lg')]: {
        marginLeft: theme.spacing(12),
        marginRight: theme.spacing(12),
      },
    },
    layout: {
      flexGrow: 1,
    },
  }),
)

const BaseLayout = ({ withHeader, withFooter, children }) => {
  const classes = useStyles()
  return (
    <>
      <CssBaseline />
      <Masthead />
      <section className={classes.appContainer}>
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
  withHeader: PropTypes.bool,
  withFooter: PropTypes.bool,
}

BaseLayout.defaultProps = {
  withHeader: true,
  withFooter: true,
}

export default BaseLayout
