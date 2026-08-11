import React from 'react'
import { useSelector } from 'react-redux'
import { Button, Typography, createStyles, makeStyles } from '@material-ui/core'
import useMinifiedActions from '../../../CreateUrlModal/helpers/minifiedActions.js'
import { downloadUrls } from '../../../../../app/util/download.js'
import { GoGovReduxState } from '../../../../../app/reducers/types.js'

const useStyles = makeStyles((theme) =>
  createStyles({
    downloadButtonContainer: {
      marginLeft: 20,
      width: '150px',
      flexShrink: 0,
    },
    downloadButton: {
      border: `solid 1px ${theme.palette.primary.main}`,
      height: '100%',
      width: '150px',
    },
  }),
)

function DownloadButton(): JSX.Element | null {
  const classes = useStyles()
  const tableConfig = useSelector(
    (state: GoGovReduxState) => state.user.tableConfig,
  )

  if (useMinifiedActions()) {
    return null
  }

  return (
    <span className={classes.downloadButtonContainer}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => downloadUrls(tableConfig)}
        className={classes.downloadButton}
      >
        <Typography variant="body2">Download links</Typography>
      </Button>
    </span>
  )
}

export default DownloadButton
