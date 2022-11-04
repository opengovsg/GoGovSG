import { Button, Typography, createStyles, makeStyles } from '@material-ui/core'
import React, { FunctionComponent } from 'react'
import noApiKeyGraphic from '@assets/components/apiintegration/empty-api-key-graphic/empty-api-key-graphic.svg'
import plusIcon from '@assets/components/app/base-layout/plus-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(6),
      alignItems: 'center',
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(12),
      },
    },
    emptyStateBodyText: {
      textAlign: 'center',
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
      width: '17px',
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
 * @component Default display component in place of api key generation.
 */
const NoApiKeyGraphic: FunctionComponent = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Typography variant="body1" className={classes.emptyStateBodyText}>
        GoGovSG API enables you to programmatically generate your short links.
        <br />
        Refer to our API Documentation for more information.
      </Typography>
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
          src={plusIcon}
          alt="generate api key"
        />
      </Button>
      <div className={classes.emptyStateGraphic}>
        <img src={noApiKeyGraphic} alt="empty api key graphic" />
      </div>
    </div>
  )
}

export default NoApiKeyGraphic
