import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router-dom'

import { useMediaQuery, useTheme } from '@material-ui/core'
import homeActions from '~/actions/home'
import loginActions from '~/actions/login'
import { USER_PAGE } from '~/util/types'
import TrustedBySliver from './TrustedBySliver'
import StatisticsSliver from './StatisticsSliver'
import DescriptionSliver from './FeatureListSliver'
import Section from '../Section'
import LandingGraphicSilver from './LandingGraphicSilver'
import IntegratedSearchLandingGraphic from './IntegratedSearchLandingGraphic'
import BaseLayout from '../BaseLayout'
import { IS_SEARCH_HIDDEN } from '../../util/config'
import { GAEvent, GAPageView } from '../../actions/ga'

const mapDispatchToProps = (dispatch) => ({
  getLinksToRotate: () => dispatch(homeActions.getLinksToRotate()),
  getIsLoggedIn: () => dispatch(loginActions.isLoggedIn()),
})

const mapStateToProps = (state, ownProps) => ({
  onCreateUrl: ownProps.onCreateUrl,
  history: ownProps.history,
  isLoggedIn: state.login.isLoggedIn,
  linksToRotate: state.home.linksToRotate,
})

const HomePage = (props) => {
  const { isLoggedIn } = props
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))

  // Google Analytics: Home Page
  useEffect(() => {
    GAPageView('HOME PAGE')
    GAEvent('home page', 'Entering home page')
  }, [])

  useEffect(() => {
    const { getLinksToRotate, getIsLoggedIn } = props
    getLinksToRotate()
    getIsLoggedIn()
  })

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
      {IS_SEARCH_HIDDEN ? (
        <LandingGraphicSilver />
      ) : (
        <IntegratedSearchLandingGraphic />
      )}
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

HomePage.propTypes = {
  history: PropTypes.shape({}).isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HomePage),
)
