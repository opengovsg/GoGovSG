import React, { FunctionComponent } from 'react'
import Typography from '@material-ui/core/Typography'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import BaseLayout from '../../BaseLayout'

const useStyles = makeStyles((theme) =>
  createStyles({
    heroContent: {
      margin: '0 auto',
      padding: theme.spacing(8, 2, 6),
    },
  }),
)

type NotFoundPageProps = {
  match: {
    params: {
      shortUrl: boolean
    }
  }
}

const NotFoundPage: FunctionComponent<NotFoundPageProps> = ({
  match,
}: NotFoundPageProps) => {
  const classes = useStyles()
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
