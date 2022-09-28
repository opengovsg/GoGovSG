import React from 'react'
import { Button } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'

type TableTagProps = {
  tag: string
  onClick: () => void
}

const useTableTagStyles = makeStyles((theme) => {
  return createStyles({
    root: {
      fontWeight: 400,
      fontSize: '14px',
      background: theme.palette.secondary.main,
      '&:hover': {
        background: theme.palette.secondary.dark,
      },
      borderRadius: '5px',
      display: 'inline',
      marginRight: theme.spacing(0.5),
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      minWidth: 0,
      minHeight: 0,
      color: 'white',
    },
  })
})

export default function TableTag({ tag, onClick }: TableTagProps) {
  const classes = useTableTagStyles()
  return (
    <Button
      variant="contained"
      size="small"
      className={classes.root}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      disableRipple
    >
      {tag}
    </Button>
  )
}
