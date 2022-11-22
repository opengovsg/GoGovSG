import React, { FunctionComponent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  Button,
  Dialog,
  IconButton,
  TextField,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { GoGovReduxState } from '../../../app/reducers/types'
import { GAEvent, GAPageView } from '../../../app/util/ga'
import apiActions from '../../actions'
import useFullScreenDialog from '../../../user/helpers/fullScreenDialog'
import CopyIcon from '../../widgets/CopyIcon'
import rootActions from '../../../app/components/pages/RootPage/actions'

const useStyles = makeStyles((theme) =>
  createStyles({
    headerText: {
      marginTop: theme.spacing(3),
    },
    modalWrapper: {
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'column',
      marginLeft: theme.spacing(3),
      marginRight: theme.spacing(3),
    },
    copyApiKeyButton: {
      alignSelf: 'center',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      paddingLeft: theme.spacing(10),
      paddingRight: theme.spacing(10),
      color: 'white',
      background: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    apiKeyTextField: {
      marginTop: theme.spacing(2),
      width: '100%',
    },
    apiKeyTextInput: {
      paddingRight: theme.spacing(0.5),
    },
    copyButton: {
      padding: theme.spacing(0.75),
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(1.5),
      },
    },
  }),
)

const ApiKeyModal: FunctionComponent = () => {
  const isFullScreenDialog = useFullScreenDialog()
  const classes = useStyles({ isFullScreenDialog })
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
      open={apiKeyModal}
    >
      <div className={classes.modalWrapper}>
        <Typography className={classes.headerText} variant="h3" color="primary">
          Save your API Key
        </Typography>
        <Typography className={classes.headerText} color="primary">
          Please make a copy of your API key as it will be shown only once.
        </Typography>
        <TextField
          className={classes.apiKeyTextField}
          value={apiKey}
          disabled
          variant="outlined"
          InputProps={{
            className: classes.apiKeyTextInput,
            endAdornment: (
              <IconButton
                className={classes.copyButton}
                onClick={() => {
                  navigator.clipboard
                    .writeText(apiKey)
                    .then(() =>
                      dispatch(
                        rootActions.setSuccessMessage(
                          'API Key has been copied to clipboard.',
                        ),
                      ),
                    )
                    .catch(() =>
                      dispatch(
                        rootActions.setErrorMessage(
                          'Error copying API Key to clipboard.',
                        ),
                      ),
                    )
                }}
              >
                <CopyIcon size={24} color="#BBBBBB" />
              </IconButton>
            ),
          }}
        />
        <Button
          className={classes.copyApiKeyButton}
          onClick={closeApiKeyModal}
          variant="contained"
          fullWidth={false}
        >
          Yes, I have copied
        </Button>
      </div>
    </Dialog>
  )
}

export default ApiKeyModal
