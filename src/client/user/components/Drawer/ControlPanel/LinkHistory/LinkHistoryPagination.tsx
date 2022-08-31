import React from 'react'
import { Grid, IconButton, createStyles, makeStyles } from '@material-ui/core'
import arrowLeftIcon from '../assets/arrow-left-icon.svg'
import arrowRightIcon from '../assets/arrow-right-icon.svg'

const useStyles = makeStyles(() =>
  createStyles({
    pageSelectGrid: {
      fontWeight: 500,
      color: '#767676',
      top: 0,
      left: 0,
      display: 'flex',
      justifyContent: 'right',
      width: '100%',
      marginBottom: '60px',
    },
    gridItemHorizontalPadding: {
      display: 'flex',
      justifyContent: 'middle',
      '&:first-child': {
        paddingRight: 34,
      },
      '&:last-child': {
        paddingLeft: 34,
      },
    },
    gridAlignVerticalMid: {
      display: 'flex',
      alignContent: 'space-around',
      flexWrap: 'wrap',
    },
  }),
)

type PaginationActionComponentProp = {
  pageCount: number
  onChangePage: (page: number) => void
  page: number
}

export default function LinkHistoryPagination({
  pageCount,
  onChangePage,
  page,
}: PaginationActionComponentProp) {
  const classes = useStyles()
  return (
    <Grid className={classes.pageSelectGrid}>
      <Grid item className={classes.gridItemHorizontalPadding}>
        <IconButton
          onClick={() => onChangePage(page - 1)}
          disabled={page - 1 <= 0}
        >
          <img src={arrowLeftIcon} alt="Previous page" draggable={false} />
        </IconButton>
      </Grid>
      <Grid item className={classes.gridAlignVerticalMid}>
        {`Page ${page} of ${pageCount}`}
      </Grid>
      <Grid item className={classes.gridItemHorizontalPadding}>
        <IconButton
          onClick={() => onChangePage(page + 1)}
          disabled={pageCount < page + 1}
        >
          <img src={arrowRightIcon} alt="Next page" draggable={false} />
        </IconButton>
      </Grid>
    </Grid>
  )
}
