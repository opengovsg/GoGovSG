import React from 'react'
import {
  Typography,
  createStyles,
  makeStyles,
  useTheme,
  useMediaQuery,
} from '@material-ui/core'

import { useDrawerState } from '..'
import CopyButton from '../../Widgets/CopyButton'

const useStyles = makeStyles((theme) =>
  createStyles({
    drawerTitleDiv: {
      marginBottom: theme.spacing(6.5),
      marginTop: theme.spacing(1.5),
      [theme.breakpoints.up('md')]: {
        alignItems: 'center',
        marginTop: 0,
      },
    },
    copyButtonWrapper: {
      marginLeft: -8,
    },
    headerText: {
      marginBottom: '6px',
      [theme.breakpoints.up('md')]: {
        marginTop: '6px',
      },
    },
  }),
)

export default function DrawerHeader() {
  const classes = useStyles()
  const shortUrl = useDrawerState().relevantShortLink || ''
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <div className={classes.drawerTitleDiv}>
      <Typography
        variant={isMobileView ? 'h6' : 'h3'}
        color="primary"
        className={classes.headerText}
      >
        Edit link
      </Typography>
      <div className={classes.copyButtonWrapper}>
        <CopyButton
          shortUrl={shortUrl}
          iconSize={20}
        />
      </div>
    </div>
  )
}
