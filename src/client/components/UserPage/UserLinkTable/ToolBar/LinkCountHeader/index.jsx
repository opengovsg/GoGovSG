import React from 'react'
import { useSelector } from 'react-redux'
import { Typography, createStyles, makeStyles } from '@material-ui/core'

import useMinifiedActions from '../util/minifiedActions'

const useStyles = makeStyles(() =>
  createStyles({
    linkCountHeader: {
      flex: 1,
      alignSelf: 'center',
      marginRight: 20,
      whiteSpace: 'nowrap',
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
        variant="h3"
        color="primary"
      >
        {urlCount}
        {' links'}
      </Typography>
    )
  )
}
