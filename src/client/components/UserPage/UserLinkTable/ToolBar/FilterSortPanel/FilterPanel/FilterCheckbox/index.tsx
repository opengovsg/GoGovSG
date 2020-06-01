import React from 'react'
import { IconButton, createStyles, makeStyles } from '@material-ui/core'
import CheckIcon from '../../widgets/CheckIcon'

const useStyles = makeStyles(() =>
  createStyles({
    uncheckedIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '2px',
      border: 'solid 1px #384a51',
    },
    filled: {
      backgroundColor: '#384a51',
      display: 'flex',
      alignItems: 'center',
      justifyContents: 'center',
    },
    icon: {
      width: '20px',
      display: 'flex',
      marginLeft: '-1px',
      filter: 'invert(100%)',
    },
  }),
)

export type FilterCheckboxProps = {
  checked: boolean
  className: string
  onClick: () => void
}

export default ({ checked, className, onClick }: FilterCheckboxProps) => {
  const classes = useStyles()
  return (
    <IconButton className={className} onClick={onClick}>
      {checked ? (
        <div className={`${classes.uncheckedIcon} ${classes.filled}`}>
          <CheckIcon size={24} color="#fff" />
        </div>
      ) : (
        <div className={classes.uncheckedIcon} />
      )}
    </IconButton>
  )
}
