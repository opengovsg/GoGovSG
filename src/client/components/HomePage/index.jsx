import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router-dom'
import 'boxicons'

import loginActions from '~/actions/login'
import { USER_PAGE } from '~/util/types'
import TrustedBySliver from './TrustedBySliver'
import FaqSliver from './FaqSliver'
import DescriptionSliver from './FeatureListSliver'
import SectionBackground from '../SectionBackground'
import LandingGraphicSliver from './LandingGraphicSliver'
import BaseLayout from '../BaseLayout'

const mapDispatchToProps = (dispatch) => ({
  getIsLoggedIn: () => dispatch(loginActions.isLoggedIn()),
})

const mapStateToProps = (state, ownProps) => ({
  onCreateUrl: ownProps.onCreateUrl,
  history: ownProps.history,
  isLoggedIn: state.login.isLoggedIn,
})

const HomePage = (props) => {
  const { isLoggedIn } = props

  useEffect(() => {
    const { getIsLoggedIn } = props
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
      <SectionBackground backgroundType="light">
        <TrustedBySliver />
      </SectionBackground>
      <SectionBackground backgroundType="dark">
        <DescriptionSliver />
      </SectionBackground>
      <SectionBackground backgroundType="light">
        <FaqSliver {...props} />
      </SectionBackground>
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
