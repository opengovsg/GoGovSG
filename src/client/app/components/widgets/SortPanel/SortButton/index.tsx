import React from 'react'
import { Button, Typography } from '@mui/material'
import useStyles from '../../../../../user/components/UserLinkTable/ToolBar/FilterSortPanel/styles'
import CheckIcon from '../../../../../user/components/UserLinkTable/ToolBar/FilterSortPanel/widgets/CheckIcon'

export type SortButtonProps = {
  columnLabel: string
  isSelected: boolean
  onClick: () => void
}

function SortButton({ columnLabel, isSelected, onClick }: SortButtonProps) {
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
      {isSelected && <CheckIcon className={classes.checkIcon} />}
    </Button>
  )
}

export default SortButton
