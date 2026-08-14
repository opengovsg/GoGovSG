import React, { FunctionComponent } from 'react'
import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import BaseLayout from '../../BaseLayout'

const useStyles = makeStyles((theme) =>
  createStyles({
    heroContent: {
      margin: '0 auto',
      padding: theme.spacing(8, 2, 6),
    },
  }),
)

const NotFoundPage: FunctionComponent = () => {
  const classes = useStyles()
  const { shortUrl } = useParams<{ shortUrl: string }>()
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
          variant="h3"
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

export default NotFoundPage
