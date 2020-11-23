import React, { useEffect, useRef, useState, FunctionComponent } from 'react'
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
import { GoGovReduxState } from '../../reducers/types'

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

type BaseLayoutProps = {
  withHeader?: boolean,
  headerBackgroundType?: string,
  withFooter?: boolean,
  withLowFooter?: boolean,
  hideNavButtons?: boolean,
}

const BaseLayout: FunctionComponent<BaseLayoutProps> = ({
  withHeader = true,
  headerBackgroundType = 'dark',
  withFooter = true,
  withLowFooter = true,
  children,
  hideNavButtons = false,
}) => {
  const classes = useStyles()
  const path = useLocation().pathname
  const isIE = useIsIE()
  const message = useSelector((state: GoGovReduxState) => state.user.message)

  const toStick = isIE || (message? true : false) 
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

export default BaseLayout
