import React from 'react'
import { makeStyles, createStyles, Typography } from '@material-ui/core'

import { ApplyAppMargins } from '../AppMargins'
import cautionLogo from './assets/ie-banner-caution.svg'

const BANNER_TEXT =
  'Go.gov.sg may not display correctly in this browser. Please use a recent version of Chrome, Firefox, Safari, or Edge.'

const useStyles = makeStyles((theme) =>
  createStyles({
    bannerContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      minHeight: 50,
      backgroundColor: theme.palette.primary.main,
      color: '#F9F9F9',
      paddingTop: 15,
      paddingBottom: 15,
    },
    appMargins: {
      width: '100%',
    },
    bannerContent: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      width: '100%',
    },
    icon: {
      marginRight: 6.67,
    },
    typography: {
      fontSize: 13,
      fontWeight: 400,
      [theme.breakpoints.up('xs')]: {
        fontSize: 14,
      },
    },
  }),
)

export default function BannerForIE() {
  const classes = useStyles()
  return (
    <div className={classes.bannerContainer}>
      <ApplyAppMargins className={classes.appMargins}>
        <div className={classes.bannerContent}>
          <img className={classes.icon} src={cautionLogo} draggable={false} />
          <Typography className={classes.typography}>{BANNER_TEXT}</Typography>
        </div>
      </ApplyAppMargins>
    </div>
  )
}
