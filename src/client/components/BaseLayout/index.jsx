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
        position: 'absolute',
        minWidth: '100%',
        minHeight: '100vh',
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
    appWideMargins: {
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
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      '&>div': {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      },
    },
  }),
)

const BaseLayout = ({ children }) => {
  const classes = useStyles()
  return (
    <>
      <CssBaseline />
      <Masthead />
      <main className={classes.appWideMargins}>
        <BaseLayoutHeader />
        <main className={classes.layout}>{children}</main>
        <SectionBackground backgroundType="dark">
          <BaseLayoutFooter />
        </SectionBackground>
      </main>
    </>
  )
}

BaseLayout.propTypes = {
  children: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
}

export default BaseLayout
