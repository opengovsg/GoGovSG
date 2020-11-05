import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import { CssBaseline, createStyles, makeStyles } from '@material-ui/core'

import { useSelector } from 'react-redux'
import Masthead from './Masthead'
import BaseLayoutHeader from './BaseLayoutHeader'
import BaseLayoutFooter from './BaseLayoutFooter'
import BaseLayoutLowFooter from './BaseLayoutLowFooter'
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
  withLowFooter,
  children,
  hideNavButtons,
}) => {
  const classes = useStyles()
  const path = useLocation().pathname
  const isIE = useIsIE()
  const message = useSelector((state) => state.user.message)

  const toStick = isIE || message
  // To store y-position to trigger useEffect
  const prevScrollY = useRef(0)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset
      // height of mast
      if (currentScrollY >= 28) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
      prevScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [prevScrollY])

  return (
    <>
      <CssBaseline />
      <Masthead isSticky={isSticky} toStick={toStick} />
      {path === USER_PAGE && isIE && <BannerForIE isSticky={isSticky} />}
      {path === USER_PAGE && message && (
        <Banner text={message} isSticky={isSticky} />
      )}
      {withHeader && (
        <BaseLayoutHeader
          backgroundType={headerBackgroundType}
          hideNavButtons={hideNavButtons}
          isSticky={isSticky}
          toStick={toStick}
        />
      )}
      <div className={classes.layout}>{children}</div>
      {withFooter && <BaseLayoutFooter />}
      {withLowFooter && <BaseLayoutLowFooter />}
    </>
  )
}

BaseLayout.propTypes = {
  withHeader: PropTypes.bool,
  headerBackgroundType: PropTypes.string,
  withFooter: PropTypes.bool,
  withLowFooter: PropTypes.bool,
  hideNavButtons: PropTypes.bool,
}

BaseLayout.defaultProps = {
  withHeader: true,
  headerBackgroundType: 'dark',
  withFooter: true,
  withLowFooter: true,
  hideNavButtons: false,
}

export default BaseLayout
