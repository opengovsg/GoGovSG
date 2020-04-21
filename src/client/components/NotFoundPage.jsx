import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import textPageStyle from '~/styles/textPage'
import BaseLayout from './BaseLayout'

const NotFoundPage = ({ classes, match }) => {
  const { params } = match
  const { shortUrl } = params
  const message = shortUrl ? (
    <>
      Are you sure{' '}
      <strong>
        {document.location.host}/{shortUrl}
      </strong>{' '}
      was a valid GoGovSg link?
    </>
  ) : (
    <span>Are you sure you used a valid GoGovSg link?</span>
  )

  return (
    <BaseLayout>
      <div className={classes.heroContent}>
        <Typography
          variant="h2"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          How odd.
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          There&#39;s nothing to be found here.
        </Typography>
        <Typography align="center" color="textPrimary" gutterBottom>
          {message}
        </Typography>
      </div>
    </BaseLayout>
  )
}

NotFoundPage.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  match: PropTypes.shape({}).isRequired,
}
export default withStyles(textPageStyle)(NotFoundPage)
