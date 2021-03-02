import React from 'react'
import { useDispatch } from 'react-redux'
import { saveAs } from 'file-saver'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import rootActions from '../../../../../../../app/components/pages/RootPage/actions'
import downloadIcon from '../../assets/download.svg'
import { get } from '../../../../../../../app/util/requests'
import useIsIE from '../../../../../../../app/components/BaseLayout/util/ie'
import { useDrawerState } from '../../../../index'
import { GAEvent } from '../../../../../../../app/util/ga'

async function downloadClicks(shortUrl: string, onError: () => void) {
  const offsetDays = 3650
  const url = `/api/link-stats?url=${shortUrl}&offset=${offsetDays}`
  const response = await get(url)
  if (!response.ok) {
    GAEvent('Link stats CSV download', shortUrl, 'unsuccessful')
    onError()
    return
  }
  const data = await response.json()
  const clicksData = data.dailyClicks
  const clicksArray = [['date', 'clicks\n']]
  clicksData.forEach((c: any) => clicksArray.push([c.date, `${c.clicks}\n`]))
  const blob = new Blob([clicksArray.join('')], {
    type: 'text/csv;charset=utf-8',
  })

  if (useIsIE()) {
    navigator.msSaveBlob(blob, 'clicks.csv')
  } else {
    saveAs(blob, 'clicks.csv')
  }
  GAEvent('Link stats CSV download', shortUrl, 'successful')
}

const useStyles = makeStyles(() => ({
  button: {
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    padding: 0,
    outline: 0,
    background: 'transparent',
    cursor: 'pointer',
  },
  text: {
    padding: '5px 0',
    display: 'inline-block',
  },
  icon: {
    padding: '0 5px',
  },
}))

export default function DownloadClicksButton() {
  const shortUrl = useDrawerState().relevantShortLink!
  const classes = useStyles()
  const dispatch = useDispatch()
  const onError = () =>
    dispatch(rootActions.setErrorMessage('Error downloading urls.'))
  return (
    <button
      className={classes.button}
      type="button"
      onClick={() => downloadClicks(shortUrl, onError)}
    >
      <Typography color="primary" variant="body2" className={classes.text}>
        Download full link click statistics here
      </Typography>
      <img
        src={downloadIcon}
        alt="download icon"
        aria-hidden
        className={classes.icon}
      />
    </button>
  )
}
