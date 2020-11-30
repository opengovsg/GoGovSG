import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'

import cautionLogo from './assets/ie-banner-caution.svg'
import Banner from './widgets/Banner'

type BannerForIEProps = {
  isSticky: boolean
}

const BANNER_TEXT =
  'Go.gov.sg is not supported on Internet Explorer. Some features may not work correctly.'

const useStyles = makeStyles(() =>
  createStyles({
    icon: {
      marginRight: 6.67,
    },
  }),
)

export default function BannerForIE({ isSticky }: BannerForIEProps) {
  const classes = useStyles()
  const icon = (
    <img className={classes.icon} src={cautionLogo} draggable={false} />
  )
  return <Banner icon={icon} text={BANNER_TEXT} isSticky={isSticky} />
}
