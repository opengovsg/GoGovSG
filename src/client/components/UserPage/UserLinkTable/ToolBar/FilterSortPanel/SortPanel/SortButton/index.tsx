import React from 'react'
import { Button, Typography } from '@material-ui/core'
import useStyles from '../../styles'
import 'boxicons'

export type SortButtonProps = {
  columnLabel: string
  isSelected: boolean
  onClick: () => void
}

const SortButton = ({ columnLabel, isSelected, onClick }: SortButtonProps) => {
  const classes = useStyles()
  return (
    <Button
      classes={{ root: classes.sortButtonRoot }}
      className={isSelected ? classes.sortButtonSelected : classes.sortButton}
      fullWidth
      onClick={() => onClick()}
    >
      <Typography variant="body2" className={classes.columnLabel}>
        {columnLabel}
      </Typography>
      {isSelected && (
        <div className={classes.checkIcon}>
          <box-icon name="check" size="cssSize" />
        </div>
      )}
    </Button>
  )
}

export default SortButton
