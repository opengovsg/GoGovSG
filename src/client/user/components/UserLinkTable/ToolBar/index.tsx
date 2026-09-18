import React from 'react'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
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
      [theme.breakpoints.down('lg')]: {
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
