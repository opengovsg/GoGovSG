import React, { FunctionComponent } from 'react'
import {
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
  Hidden,
} from '@material-ui/core'
import emptyStateGraphic from '../assets/empty-state-graphic.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(8),
      alignItems: 'center',
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(16),
      },
    },
    emptyStateGraphic: {
      marginTop: '48px',
      marginBottom: '76px',
      position: 'relative',
      right: theme.spacing(5),
      zIndex: -1,
    },
    emptyStateBodyText: {
      marginTop: '8px',
      textAlign: 'center',
    },
  }),
)

const EmptyStateGraphic: FunctionComponent = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <div className={classes.root}>
      <Typography variant={isMobileView ? 'h5' : 'h3'}>
        What link are you looking for?
      </Typography>
      <Typography variant="body1" className={classes.emptyStateBodyText}>
        Type in a keyword to get started.{' '}
        <Hidden mdUp>
          <br />
        </Hidden>
        e.g. Covid-19
      </Typography>
      <div className={classes.emptyStateGraphic}>
        <img src={emptyStateGraphic} alt="empty search graphic" />
      </div>
    </div>
  )
}

export default EmptyStateGraphic
