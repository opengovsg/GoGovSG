import React from 'react'
import PropTypes from 'prop-types'
import { CssBaseline, createStyles, makeStyles } from '@material-ui/core'
import Masthead from './Masthead'
import BaseLayoutHeader from './BaseLayoutHeader'
import BaseLayoutFooter from './BaseLayoutFooter'

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
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      '-ms-flex': '1 1 auto',
    },
  }),
)

const BaseLayout = ({
  withHeader,
  headerBackgroundType,
  withFooter,
  children,
}) => {
  const classes = useStyles()
  return (
    <>
      <CssBaseline />
      <Masthead />
      {withHeader && <BaseLayoutHeader backgroundType={headerBackgroundType} />}
      <div className={classes.layout}>{children}</div>
      {withFooter && <BaseLayoutFooter />}
    </>
  )
}

BaseLayout.propTypes = {
  withHeader: PropTypes.bool,
  headerBackgroundType: PropTypes.string,
  withFooter: PropTypes.bool,
}

BaseLayout.defaultProps = {
  withHeader: true,
  headerBackgroundType: 'dark',
  withFooter: true,
}

export default BaseLayout
