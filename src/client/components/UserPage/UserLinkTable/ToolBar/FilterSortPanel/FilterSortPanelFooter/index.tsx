import React from 'react'
import { Grid, Button } from '@material-ui/core'

import useStyles from '../styles'

export type FilterSortPanelFooterProps = {
  onApply: () => void
  onReset: () => void
}

export default ({ onApply, onReset }: FilterSortPanelFooterProps) => {
  const classes = useStyles()
  return (
    <Grid
      container
      item
      justify="flex-end"
      alignItems="center"
      className={classes.footer}
    >
      <Grid item className={classes.buttonGrid}>
        <Button
          color="primary"
          className={classes.resetButton}
          onClick={onReset}
        >
          Reset
        </Button>
      </Grid>
      <Grid item className={classes.buttonGrid}>
        <Button
          color="primary"
          variant="contained"
          className={classes.applyButton}
          onClick={onApply}
        >
          Apply
        </Button>
      </Grid>
    </Grid>
  )
}
