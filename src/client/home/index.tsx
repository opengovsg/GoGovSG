import React, { useEffect, FunctionComponent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { useMediaQuery, useTheme } from '@material-ui/core'
import homeActions from './actions'
import loginActions from '../login/actions'
import { USER_PAGE } from '../app/util/types'
import TrustedBySliver from './components/TrustedBySliver'
import StatisticsSliver from './components/StatisticsSliver'
import DescriptionSliver from './components/FeatureListSliver'
import Section from '../app/components/Section'
import LandingGraphicSilver from './components/LandingGraphicSilver'
import BaseLayout from '../app/components/BaseLayout'
import { GAEvent, GAPageView } from '../app/util/ga'
import { GoGovReduxState } from '../app/reducers/types'

const HomePage: FunctionComponent = (props) => {
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const getLinksToRotate = () => dispatch(homeActions.getLinksToRotate())
  const getIsLoggedIn = () => dispatch(loginActions.isLoggedIn())
  const isLoggedIn = useSelector((state: GoGovReduxState) => state.login.isLoggedIn)

  // Load once on start
  useEffect(() => {
    // Google Analytics: Home Page
    GAPageView('HOME PAGE')
    GAEvent('home page', 'Entering home page')
    getLinksToRotate()
    getIsLoggedIn()
  }, [])

  if (isLoggedIn) {
    return (
      <Redirect
        to={{
          pathname: USER_PAGE,
        }}
      />
    )
  }

  return (
    <BaseLayout headerBackgroundType={isMobileView ? '#f9f9f9' : 'light'}>
      <LandingGraphicSilver />
      <div id="landing-bottom">
        <Section backgroundType="light">
          <TrustedBySliver />
        </Section>
      </div>
      <Section backgroundType="dark">
        <DescriptionSliver />
      </Section>
      <Section backgroundType="light">
        <StatisticsSliver {...props} />
      </Section>
    </BaseLayout>
  )
}

export default HomePage
