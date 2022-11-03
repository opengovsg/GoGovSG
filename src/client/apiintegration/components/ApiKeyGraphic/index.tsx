import React, { FunctionComponent } from 'react'

import {
  Button,
  TextField,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import retryIcon from '@assets/components/app/base-layout/retry-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(3),
      alignItems: 'left',
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(6),
      },
    },
    apiKeyInfoText: {
      textAlign: 'left',
    },
    createApiKeyButton: {
      marginTop: '41px',
      width: '168px',
      minWidth: '90px',
      color: 'white',
      background: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    plusIcon: {
      width: '15px',
    },
    emptyStateGraphic: {
      marginTop: '63px',
      marginBottom: '76px',
      position: 'relative',
      zIndex: -1,
    },
  }),
)

/**
 * @component Default display component in place of generated api key.
 */
const ApiKeyGraphic: FunctionComponent = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Typography variant="body1" className={classes.apiKeyInfoText}>
        After generating your API key, please make a copy of it immediately as
        it will only be shown once. Upon leaving or refreshing this page, the
        key will be hidden.
        <br />
        Your API Key
      </Typography>
      <TextField
        disabled
        variant="outlined"
        type="text"
        value="******************"
      />
      <Button
        className={classes.createApiKeyButton}
        // key={}
        onClick={() => {
          alert('clicked')
        }}
      >
        Generate API Key&nbsp;
        <img
          className={classes.plusIcon}
          src={retryIcon}
          alt="generate api key"
        />
      </Button>
    </div>
  )
}

export default ApiKeyGraphic
