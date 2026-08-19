import React from 'react'
import { useSelector } from 'react-redux'
import { Typography } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

import useMinifiedActions from '../../../CreateUrlModal/helpers/minifiedActions'
import useIsFiltered from '../../../EmptyState/isFiltered'
import usePrevState from '../../../CreateUrlModal/helpers/prevState'

export function useIsFetchingUrls(): boolean {
  const isFetchingUrls = useSelector((state: any) => state.user.isFetchingUrls)
  return isFetchingUrls as boolean
}

export function useUrlCount(): number {
  const urlCount = useSelector((state: any) => state.user.urlCount)
  return urlCount as number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    linkCountHeader: {
      flexGrow: 1,
      flexShrink: 0,
      alignSelf: 'center',
      marginRight: 20,
      whiteSpace: 'nowrap',
      [theme.breakpoints.down('lg')]: {
        order: 10,
        flexBasis: '100%',
        marginTop: theme.spacing(3),
      },
    },
  }),
)

export default function LinkCountHeader() {
  const isFetchingUrls = useIsFetchingUrls()
  const urlCount = useUrlCount()
  const isMinified = useMinifiedActions()
  const isFiltered = useIsFiltered()
  const classes = useStyles()

  const nextDescriptor = !isFiltered ? 'links' : 'results'
  const prevState = usePrevState(nextDescriptor, !isFetchingUrls) || 'links'
  const currentDescriptor = !isFetchingUrls ? nextDescriptor : prevState

  return (
    <Typography
      className={classes.linkCountHeader}
      variant={isMinified ? 'h4' : 'h3'}
      color="primary"
    >
      {`${urlCount} ${currentDescriptor}`}
    </Typography>
  )
}
