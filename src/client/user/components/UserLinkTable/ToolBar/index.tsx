import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import LinkCountHeader from './LinkCountHeader/index.js'
import SearchInput from './SearchInput/index.js'
import CreateLinkButton from './Buttons/CreateLinkButton.js'
import DownloadButton from './Buttons/DownloadButton.js'

const useStyles = makeStyles((theme) =>
  createStyles({
    toolBar: {
      display: 'flex',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        flexWrap: 'wrap',
        marginBottom: theme.spacing(1),
      },
    },
  }),
)

function ToolBar() {
  const classes = useStyles()
  return (
    <div className={classes.toolBar}>
      <LinkCountHeader />
      <SearchInput />
      <DownloadButton />
      <CreateLinkButton />
    </div>
  )
}

export default ToolBar
