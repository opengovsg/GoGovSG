import React from 'react'
import { useSelector } from 'react-redux'
import { Typography, createStyles, makeStyles } from '@material-ui/core'

import useMinifiedActions from '../util/useMinifiedActions'

const useStyles = makeStyles(() =>
  createStyles({
    linkCountHeader: {
      flex: 1,
      alignSelf: 'center',
    },
  }),
)

export default function LinkCountHeader() {
  const urlCount = useSelector((state) => state.user.urlCount)
  const showHeader = !useMinifiedActions()
  const classes = useStyles()
  return (
    showHeader && (
      <Typography
        className={classes.linkCountHeader}
        variant="h2"
        color="primary"
      >
        {urlCount}
        {' links'}
      </Typography>
    )
  )
}
