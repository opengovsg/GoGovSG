import React, { FunctionComponent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  Button,
  Dialog,
  TextField,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { GoGovReduxState } from '../../../app/reducers/types'
import { GAEvent, GAPageView } from '../../../app/util/ga'
import apiActions from '../../actions'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {},
    headerText: {
      alignSelf: 'flex',
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(2),
    },
  }),
)

const ApiKeyModal: FunctionComponent = () => {
  const classes = useStyles()
  const { apiKeyModal, apiKey } = useSelector(
    (state: GoGovReduxState) => state.api,
  )
  const dispatch = useDispatch()
  const closeApiKeyModal = () => dispatch(apiActions.closeApiKeyModal())
  useEffect(() => {
    if (apiKeyModal) {
      GAPageView('API KEY VIEW PAGE')
      GAEvent('api page', 'api key view page')
      return () => {
        GAPageView('API PAGE')
      }
    }
    return undefined
  }, [apiKeyModal])
  return (
    <Dialog
      aria-labelledby="apiKeyModal"
      aria-describedby="api-key-modal"
      fullScreen={false}
      fullWidth
      maxWidth="sm"
      onClose={closeApiKeyModal}
      open={apiKeyModal}
    >
      <Typography className={classes.headerText} variant="h3" color="primary">
        Save your API Key
      </Typography>
      <Typography className={classes.headerText} variant="h6" color="primary">
        Please make a copy of your API key as it will be shown only once
      </Typography>
      <TextField value={apiKey} disabled />
      <Button
        onClick={() => {
          dispatch(apiActions.closeApiKeyModal())
        }}
        variant="contained"
        fullWidth={false}
      >
        Yes, I have copied
      </Button>
    </Dialog>
  )
}

export default ApiKeyModal
