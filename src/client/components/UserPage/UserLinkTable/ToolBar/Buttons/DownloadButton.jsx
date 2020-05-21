import React from 'react'
import { useSelector } from 'react-redux'
import { Button, createStyles, makeStyles, Typography } from '@material-ui/core'

import useMinifiedActions from '../util/minifiedActions'
import { downloadUrls } from '../../../../../util/download'

const useStyles = makeStyles((theme) =>
  createStyles({
    downloadButtonContainer: {
      marginLeft: theme.spacing(1.5),
      width: '150px',
    },
    downloadButton: {
      border: 'solid 1px #456682',
      height: '100%',
      width: '150px',
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
        <Button
          variant="outlined"
          onClick={() => downloadUrls(urlCount, tableConfig)}
          className={classes.downloadButton}
        >
          <Typography variant="body2">Download Links</Typography>
        </Button>
      </span>
    )
  )
}
