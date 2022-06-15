import React from 'react'
import { useSelector } from 'react-redux'
import { Button, Typography, createStyles, makeStyles } from '@material-ui/core'
import useMinifiedActions from '../../../CreateUrlModal/helpers/minifiedActions'
import { downloadUrls } from '../../../../../app/util/download'
import { GoGovReduxState } from '../../../../../app/reducers/types'

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

const DownloadButton = () => {
  const classes = useStyles()
  const urlCount = useSelector((state: GoGovReduxState) => state.user.urlCount)
  const tableConfig = useSelector(
    (state: GoGovReduxState) => state.user.tableConfig,
  )

  return (
    // Only shown when actions are not minified.
    <>
      {!useMinifiedActions() && (
        <span className={classes.downloadButtonContainer}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => downloadUrls(urlCount, tableConfig)}
            className={classes.downloadButton}
          >
            <Typography variant="body2">Download links</Typography>
          </Button>
        </span>
      )}
    </>
  )
}

export default DownloadButton
