import React from 'react'
import { Grid, IconButton, createStyles, makeStyles } from '@material-ui/core'
import arrowLeftIcon from '../../../assets/arrow-left-icon.svg'
import arrowRightIcon from '../../../assets/arrow-right-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    pageSelectGrid: {
      fontWeight: 500,
      color: '#767676',
      width: 'auto',
      marginRight: '-139px',
      [theme.breakpoints.up('sm')]: {
        marginLeft: 'auto',
      },
    },
  }),
)

export default ({ pageCount, onChangePage, page }) => {
  const classes = useStyles()
  return (
    <Grid
      container
      item
      alignItems="center"
      spacing={5}
      className={classes.pageSelectGrid}
    >
      <Grid item>
        <IconButton
          onClick={(event) => onChangePage(event, page - 1)}
          disabled={page <= 0}
        >
          <img src={arrowLeftIcon} alt="Previous page" draggable={false} />
        </IconButton>
      </Grid>
      <Grid item>{`Page ${page + 1} of ${pageCount}`}</Grid>
      <Grid item>
        <IconButton
          onClick={(event) => onChangePage(event, page + 1)}
          disabled={pageCount <= page + 1}
        >
          <img src={arrowRightIcon} alt="Next page" draggable={false} />
        </IconButton>
      </Grid>
    </Grid>
  )
}
