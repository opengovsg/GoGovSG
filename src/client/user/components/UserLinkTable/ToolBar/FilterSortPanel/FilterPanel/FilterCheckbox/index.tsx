import React from 'react'
import { IconButton } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import CheckIcon from '../../widgets/CheckIcon'

const useStyles = makeStyles((theme) =>
  createStyles({
    uncheckedIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '2px',
      border: `solid 1px ${theme.palette.primary.main}`,
    },
    filled: {
      backgroundColor: theme.palette.primary.main,
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

export default function ({ checked, className, onClick }: FilterCheckboxProps) {
  const classes = useStyles()
  return (
    <IconButton className={className} onClick={onClick} size="large">
      {checked ? (
        <div className={`${classes.uncheckedIcon} ${classes.filled}`}>
          <CheckIcon color="#fff" />
        </div>
      ) : (
        <div className={classes.uncheckedIcon} />
      )}
    </IconButton>
  )
}
