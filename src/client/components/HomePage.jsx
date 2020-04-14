import React, { useEffect } from 'react'
import { Trans } from 'react-i18next'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { Redirect, withRouter } from 'react-router-dom'
import i18next from 'i18next'
import homePageStyle from '~/styles/homePage'
import homeActions from '~/actions/home'
import loginActions from '~/actions/login'
import { USER_PAGE } from '~/util/types'
import numberFormatter from '~/util/format'
import mainImage from '~/assets/landing-main.png'
import trustedByLogo1 from '~/assets/trusted-by-logos/1.png'
import trustedByLogo2 from '~/assets/trusted-by-logos/2.png'
import trustedByLogo3 from '~/assets/trusted-by-logos/3.png'
import trustedByLogo4 from '~/assets/trusted-by-logos/4.png'
import trustedByLogo5 from '~/assets/trusted-by-logos/5.png'
import trustedByLogo6 from '~/assets/trusted-by-logos/6.png'
import trustedByLogo7 from '~/assets/trusted-by-logos/7.png'
import trustedByLogo8 from '~/assets/trusted-by-logos/8.png'
import 'boxicons'

const mapDispatchToProps = dispatch => ({
  loadStats: () => dispatch(homeActions.loadStats()),
  getIsLoggedIn: () => dispatch(loginActions.isLoggedIn()),
})

const mapStateToProps = (state, ownProps) => ({
  classes: ownProps.classes,
  onCreateUrl: ownProps.onCreateUrl,
  history: ownProps.history,
  statistics: state.home.statistics,
  isLoggedIn: state.login.isLoggedIn,
})

const generateStatsString = ({
  statistics: { userCount, linkCount, clickCount },
}) => {
  let statsStringBuilder = ''
  if (userCount !== null && clickCount !== null && linkCount !== null) {
    statsStringBuilder = `, with ${numberFormatter.format(userCount)} users`
    statsStringBuilder += `, ${numberFormatter.format(linkCount)} links`
    statsStringBuilder += `, and ${numberFormatter.format(
      clickCount
    )} total clicks`
  }
  return statsStringBuilder
}

const cards = [
  {
    icon: 'lock',
    title: 'Anti-phishing',
    description: <Trans>homePage.features.antiPhishing.description</Trans>,
  },
  {
    icon: 'customize',
    title: 'Customised',
    description: <Trans>homePage.features.customised.description</Trans>,
  },
  {
    icon: 'line-chart',
    title: 'Analytics',
    description: <Trans>homePage.features.analytics.description</Trans>,
  },
]

const HomePage = (props) => {
  const { classes, isLoggedIn } = props

  useEffect(() => {
    const { loadStats, getIsLoggedIn } = props
    getIsLoggedIn()
    loadStats()
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
    <React.Fragment>
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
            onClick={() => (document.getElementById('landing-bottom').scrollIntoView({ behavior: 'smooth' }))}
            size="large"
            variant="outlined"
          >
            Learn more
          </Button>
          <Typography className={classes.signInText} variant="body2">
            <Trans>general.appSignInPrompt</Trans>
            {' '}
            <Link href="/#/login" color="inherit" underline="always">
              Sign in
            </Link>
          </Typography>
        </div>
      </div>
      <div id="landing-bottom" className={classes.landingBottom}>
        <Typography
          className={classes.trustedByText}
          variant="h2"
          color="textPrimary"
          align="center"
        >
          <strong>Trusted by these agencies</strong>
        </Typography>
        <div className={classes.trustedByContainer}>
          <div className={classes.trustedByGroup}>
            <img
              className={classes.trustedLogo}
              src={trustedByLogo1}
              alt="MOM"
            />
            <img
              className={classes.trustedLogo}
              src={trustedByLogo2}
              alt="LTA"
            />
            <img
              className={classes.trustedLogo}
              src={trustedByLogo3}
              alt="MOH"
            />
            <img
              className={classes.trustedLogo}
              src={trustedByLogo4}
              alt="MSF"
            />
          </div>
          <div className={classes.trustedByGroup}>
            <img
              className={classes.trustedLogo}
              src={trustedByLogo5}
              alt="SPF"
            />
            <img
              className={classes.trustedLogo}
              src={trustedByLogo6}
              alt="IRAS"
            />
            <img
              className={classes.trustedLogo}
              src={trustedByLogo7}
              alt="MOE"
            />
            <img
              className={classes.trustedLogo}
              src={trustedByLogo8}
              alt="MHA"
            />
          </div>
        </div>
        <div className={classes.divider} />
        <Typography variant="h2" color="textPrimary" gutterBottom>
          <strong>
Why use
            {i18next.t('general.appTitle')}
          </strong>
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="textPrimary"
          paragraph
        >
          <Trans>general.appDescription.stats</Trans>
          {generateStatsString(props)}
.
        </Typography>
        <Grid container justify="center" className={classes.grid}>
          {cards.map(card => (
            <Grid item key={card.title}>
              <Card className={classes.card}>
                <box-icon name={card.icon} size="sm" />
                <CardContent>
                  <Typography color="primary" variant="h3" gutterBottom>
                    <strong>{card.title}</strong>
                  </Typography>
                  <Typography color="textPrimary">
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </React.Fragment>
  )
}

HomePage.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired,
  statistics: PropTypes.shape({}).isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
}

export default withStyles(homePageStyle)(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(HomePage))
)
