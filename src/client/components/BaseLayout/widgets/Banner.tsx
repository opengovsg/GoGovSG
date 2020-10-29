import React from 'react'
import { makeStyles, createStyles, Typography } from '@material-ui/core'

import { ApplyAppMargins } from '../../AppMargins'

type BannerForProps = {
  text: string
  icon?: React.ReactElement
  isSticky: boolean
}

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
    bannerContainerSticky: {
      display: 'flex',
      position: 'fixed',
      zIndex: 20,
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
    typography: {
      fontSize: 13,
      fontWeight: 400,
      [theme.breakpoints.up('xs')]: {
        fontSize: 14,
      },
    },
  }),
)

export default function Banner({ text, icon, isSticky }: BannerForProps) {
  const classes = useStyles()
  return (
    <div className={isSticky? classes.bannerContainerSticky: classes.bannerContainer}>
      <ApplyAppMargins className={classes.appMargins}>
        <div className={classes.bannerContent}>
          {icon}
          <Typography className={classes.typography}>{text}</Typography>
        </div>
      </ApplyAppMargins>
    </div>
  )
}
