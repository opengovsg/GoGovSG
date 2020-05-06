import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'

import CreateLinkButton from './CreateLinkButton'
import SearchInput from './SearchInput'

const useStyles = makeStyles((theme) =>
  createStyles({
    toolBar: {
      display: 'flex',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      width: '100%',
    },
  }),
)

export default function ToolBar() {
  const classes = useStyles()
  return (
    <div className={classes.toolBar}>
      <SearchInput />
      <CreateLinkButton />
    </div>
  )
}
