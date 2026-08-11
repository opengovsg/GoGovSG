import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect } from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import { GAEvent, GAPageView } from '../app/util/ga.js'
import { GoGovReduxState } from '../app/reducers/types.js'
import BaseLayout from '../app/components/BaseLayout/index.js'
import useMinifiedActions from '../user/components/CreateUrlModal/helpers/minifiedActions.js'
import { ApplyAppMargins } from '../app/components/AppMargins/index.js'
import NoApiKeyGraphic from './components/NoApiKeyGraphic/index.js'
import ApiKeyGraphic from './components/ApiKeyGraphic/index.js'
import apiActions from './actions/index.js'
import ApiKeyModal from './components/ApiKeyModal/index.js'

const useStyles = makeStyles((theme) =>
  createStyles({
    apiIntegrationHeader: {
      flexGrow: 1,
      flexShrink: 0,
      marginRight: 20,
      marginTop: theme.spacing(4),
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
function ApiIntegrationPage() {
  const dispatch = useDispatch()
  const isLoggedIn = useSelector(
    (state: GoGovReduxState) => state.login.isLoggedIn,
  )
  const isMinified = useMinifiedActions()
  const hasApiKey = useSelector((state: GoGovReduxState) => state.api.hasApiKey)
  useEffect(() => {
    dispatch(apiActions.hasApiKey())
  }, [dispatch])
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
          {hasApiKey ? <ApiKeyGraphic /> : <NoApiKeyGraphic />}
          <ApiKeyModal />
        </ApplyAppMargins>
      </BaseLayout>
    )
  }
  return <div />
}

export default ApiIntegrationPage
