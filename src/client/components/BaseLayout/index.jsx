import React from 'react'
import PropTypes from 'prop-types'
import 'boxicons'
import { CssBaseline, createStyles, makeStyles } from '@material-ui/core'
import Masthead from '~/components/Masthead'
import BaseLayoutHeader from './BaseLayoutHeader'
import BaseLayoutFooter from './BaseLayoutFooter'

const useStyles = makeStyles(() =>
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
      <BaseLayoutHeader />
      <main className={classes.layout}>{children}</main>
      <BaseLayoutFooter />
    </>
  )
}

BaseLayout.propTypes = {
  children: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
}

export default BaseLayout
