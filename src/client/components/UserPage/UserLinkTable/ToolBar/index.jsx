import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'

import LinkCountHeader from './LinkCountHeader'
import SearchInput from './SearchInput'
import CreateLinkButton from './Buttons/CreateLinkButton'
import DownloadButton from './Buttons/DownloadButton'

const useStyles = makeStyles((theme) =>
  createStyles({
    toolBar: {
      display: 'flex',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
      width: '100%',
    },
  }),
)

export default function ToolBar() {
  const classes = useStyles()
  return (
    <div className={classes.toolBar}>
      <LinkCountHeader />
      <SearchInput />
      <CreateLinkButton />
      <DownloadButton />
    </div>
  )
}
