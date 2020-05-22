import React from 'react'
import { useSelector } from 'react-redux'
import { Typography, createStyles, makeStyles } from '@material-ui/core'

import useMinifiedActions from '../util/minifiedActions'

const useStyles = makeStyles((theme) =>
  createStyles({
    linkCountHeader: {
      flex: 1,
      alignSelf: 'center',
      marginRight: 20,
      whiteSpace: 'nowrap',
      [theme.breakpoints.down('sm')]: {
        order: 10,
        flexBasis: '100%',
        marginTop: theme.spacing(3),
      },
    },
  }),
)

export default function LinkCountHeader() {
  const urlCount = useSelector((state) => state.user.urlCount)
  const isMinified = useMinifiedActions()
  const classes = useStyles()
  return (
    <Typography
      className={classes.linkCountHeader}
      variant={isMinified ? 'h4' : 'h3'}
      color="primary"
    >
      {urlCount}
      {' links'}
    </Typography>
  )
}
