import React from 'react'
import { Button, Typography } from '@material-ui/core'
import useStyles from '../../styles'
import CheckIcon from '../../widgets/CheckIcon'

export type SortButtonProps = {
  columnLabel: string
  isSelected: boolean
  onClick: () => void
}

const SortButton = ({ columnLabel, isSelected, onClick }: SortButtonProps) => {
  const classes = useStyles()
  return (
    <Button
      classes={{ root: classes.sortButtonRoot, label: classes.sortButtonLabel }}
      className={isSelected ? classes.sortButtonSelected : classes.sortButton}
      fullWidth
      onClick={() => onClick()}
    >
      <Typography variant="body2" className={classes.columnLabel}>
        {columnLabel}
      </Typography>
      {isSelected && <CheckIcon size={24} className={classes.checkIcon} />}
    </Button>
  )
}

export default SortButton
