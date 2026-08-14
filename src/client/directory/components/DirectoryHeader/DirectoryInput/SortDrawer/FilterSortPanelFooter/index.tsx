import React from 'react'
import { Button, Grid } from '@mui/material'

import useStyles from '../../styles'

export type FilterSortPanelFooterProps = {
  onApply: () => void
  onReset: () => void
}

export default function ({ onApply, onReset }: FilterSortPanelFooterProps) {
  const classes = useStyles()
  return (
    <Grid
      container
      item
      justifyContent="flex-end"
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
