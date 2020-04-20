import React, { useEffect } from 'react'
import { Trans } from 'react-i18next'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router-dom'
import 'boxicons'
import { Button, Link, Typography, withStyles } from '@material-ui/core'

import homePageStyle from '~/styles/homePage'
import loginActions from '~/actions/login'
import { USER_PAGE } from '~/util/types'
import mainImage from '~/assets/landing-page-graphics/landing-main.png'
import TrustedBySliver from './TrustedBySliver'
import FaqSliver from './FaqSliver'
import DescriptionSliver from './DescriptionSliver'

const mapDispatchToProps = (dispatch) => ({
  getIsLoggedIn: () => dispatch(loginActions.isLoggedIn()),
})

const mapStateToProps = (state, ownProps) => ({
  classes: ownProps.classes,
  onCreateUrl: ownProps.onCreateUrl,
  history: ownProps.history,
  isLoggedIn: state.login.isLoggedIn,
})

const HomePage = (props) => {
  const { classes, isLoggedIn } = props

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
    <>
      <div className={classes.landingTop}>
        <div className={classes.heroContent}>
          <div className={classes.mainText}>
            <Typography
              className={classes.mainTitle}
              variant="h1"
              color="textPrimary"
              gutterBottom
            >
              <Trans>general.appCatchphrase.styled</Trans>
            </Typography>
            <Typography
              className={classes.subtitle}
              variant="subtitle1"
              color="textPrimary"
            >
              <Trans>general.appDescription.subtitle</Trans>
            </Typography>
          </div>
          <div className={classes.mainImageDiv}>
            <img className={classes.mainImage} src={mainImage} alt="" />
          </div>
        </div>
        <div className={classes.mainSub}>
          <Button
            className={classes.learnMoreBtn}
            color="primary"
            onClick={() =>
              document
                .getElementById('landing-bottom')
                .scrollIntoView({ behavior: 'smooth' })
            }
            size="large"
            variant="outlined"
          >
            Learn more
          </Button>
          <Typography className={classes.signInText} variant="body2">
            <Trans>general.appSignInPrompt</Trans>{' '}
            <Link href="/#/login" color="inherit" underline="always">
              Sign in
            </Link>
          </Typography>
        </div>
      </div>
      <div id="landing-bottom" className={classes.landingBottom}>
        <TrustedBySliver />
        <FaqSliver {...props} />
        <DescriptionSliver />
      </div>
    </>
  )
}

HomePage.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired,
  statistics: PropTypes.shape({}).isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
}

export default withStyles(homePageStyle)(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(HomePage)),
)
