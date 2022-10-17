import { useSelector } from 'react-redux'
import React, { useEffect } from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import { GAEvent, GAPageView } from '../app/util/ga'
import { GoGovReduxState } from '../app/reducers/types'
import BaseLayout from '../app/components/BaseLayout'
import useMinifiedActions from '../user/components/CreateUrlModal/helpers/minifiedActions'
import { ApplyAppMargins } from '../app/components/AppMargins'

const useStyles = makeStyles((theme) =>
  createStyles({
    apiIntegrationHeader: {
      flexGrow: 1,
      flexShrink: 0,
      alignSelf: 'left',
      marginRight: 20,
      whiteSpace: 'nowrap',
      [theme.breakpoints.down('sm')]: {
        order: 10,
        flexBasis: '100%',
        marginTop: theme.spacing(3),
      },
    },
  }),
)

/**
 * Show the API Integration page.
 */
const ApiIntegrationPage = () => {
  const isLoggedIn = useSelector(
    (state: GoGovReduxState) => state.login.isLoggedIn,
  )
  const isMinified = useMinifiedActions()
  const hasApiKey = useSelector(
    (state: GoGovReduxState) => state.login.user.hasApiKey,
  )
  const classes = useStyles()
  useEffect(() => {
    if (isLoggedIn) {
      GAPageView('API INTEGRATION')
      GAEvent('api integration', 'main')
    }
  }, [isLoggedIn])
  if (isLoggedIn) {
    return (
      <BaseLayout>
        <ApplyAppMargins>
          <Typography
            className={classes.apiIntegrationHeader}
            variant={isMinified ? 'h4' : 'h3'}
            color="primary"
          >
            API Integration
          </Typography>
          {hasApiKey ? <div>Has API Key</div> : <div>No API Key</div>}
        </ApplyAppMargins>
      </BaseLayout>
    )
  }
  return <div />
}

export default ApiIntegrationPage
