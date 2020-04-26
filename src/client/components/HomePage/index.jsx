import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router-dom'
import 'boxicons'

import homeActions from '~/actions/home'
import loginActions from '~/actions/login'
import { USER_PAGE } from '~/util/types'
import TrustedBySliver from './TrustedBySliver'
import StatisticsSliver from './StatisticsSliver'
import DescriptionSliver from './FeatureListSliver'
import Section from '../Section'
import LandingGraphicSliver from './LandingGraphicSliver'
import BaseLayout from '../BaseLayout'

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
    <BaseLayout>
      <LandingGraphicSliver />
      <Section backgroundType="light">
        <TrustedBySliver />
      </Section>
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
