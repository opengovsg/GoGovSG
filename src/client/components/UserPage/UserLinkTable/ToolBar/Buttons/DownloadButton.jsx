import React from 'react'
import { useSelector } from 'react-redux'
import { createStyles, makeStyles } from '@material-ui/core'

import OutlinedIconButton from './templates/OutlinedIconButton'
import useMinifiedActions from '../util/useMinifiedActions'
import { downloadUrls } from '../../../../../util/download'

const useStyles = makeStyles((theme) =>
  createStyles({
    downloadButtonContainer: {
      marginLeft: theme.spacing(1.5),
    },
  }),
)

export default function DownloadButton() {
  const classes = useStyles()
  const urlCount = useSelector((state) => state.user.urlCount)
  const tableConfig = useSelector((state) => state.user.tableConfig)

  return (
    // Only shown when actions are not minified.
    !useMinifiedActions() && (
      <span className={classes.downloadButtonContainer}>
        <OutlinedIconButton onClick={() => downloadUrls(urlCount, tableConfig)}>
          <box-icon name="download" />
        </OutlinedIconButton>
      </span>
    )
  )
}
