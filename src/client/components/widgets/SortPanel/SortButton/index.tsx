import React from 'react'
import { Button, Typography } from '@material-ui/core'
import useStyles from '../../../UserPage/UserLinkTable/ToolBar/FilterSortPanel/styles'
import CheckIcon from '../../../UserPage/UserLinkTable/ToolBar/FilterSortPanel/widgets/CheckIcon'

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
      {isSelected && <CheckIcon className={classes.checkIcon} />}
    </Button>
  )
}

export default SortButton
