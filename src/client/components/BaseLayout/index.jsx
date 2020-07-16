import React from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import { CssBaseline, createStyles, makeStyles } from '@material-ui/core'

import { useSelector } from 'react-redux'
import Masthead from './Masthead'
import BaseLayoutHeader from './BaseLayoutHeader'
import BaseLayoutFooter from './BaseLayoutFooter'
import useIsIE from './util/ie'
import BannerForIE from './BannerForIE'
import { USER_PAGE } from '../../util/types'
import Banner from './widgets/Banner'

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
          minHeight: '100vh',
          overflow: 'hidden',
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
  const path = useLocation().pathname
  const isIE = useIsIE()
  const message = useSelector((state) => state.user.message)
  return (
    <>
      <CssBaseline />
      <Masthead />
      {path === USER_PAGE && isIE && <BannerForIE />}
      {path === USER_PAGE && message && <Banner text={message} />}
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
