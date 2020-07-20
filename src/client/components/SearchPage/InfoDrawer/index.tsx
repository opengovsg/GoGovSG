import React, { FunctionComponent } from 'react'
import {
  ButtonBase,
  Divider,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { ApplyAppMargins } from '../../AppMargins'
import useAppMargins from '../../AppMargins/appMargins'
import BottomDrawer from '../../widgets/BottomDrawer'
import { UrlTypePublic } from '../../../reducers/search/types'

type InfoDrawerProps = {
  onClose: () => void
  selectedUrl?: UrlTypePublic
}

// type InfoDrawerStyleProps = {}

const useStyles = makeStyles((theme) =>
  createStyles({
    shortLinkText: {
      textAlign: 'start',
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
    },
    domainText: {
      color: '#8CA6AD',
    },
    divider: {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(4),
    },
    dividerTop: {
      marginBottom: theme.spacing(4),
    },
    descriptionText: {
      color: '#384a51',
      fontWeight: 400,
      wordBreak: 'keep-all',
      minHeight: '100px',
    },
    contactEmailText: {
      color: '#767676',
      fontWeight: 400,
      wordBreak: 'break-all',
    },
    shortUrlButton: {
      justifyContent: 'flex-start',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(6),
    },
  }),
)

const InfoDrawer: FunctionComponent<InfoDrawerProps> = ({
  onClose,
  selectedUrl,
}: InfoDrawerProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const enterUrl = () => {
    if (!selectedUrl) {
      return
    }
    window.location.assign(
      `${document.location.protocol}//${document.location.host}/${selectedUrl.shortUrl}`,
    )
  }
  return (
    <BottomDrawer open={!!selectedUrl} onClose={onClose}>
      <div className={classes.content}>
        <ButtonBase className={classes.shortUrlButton} onClick={enterUrl}>
          <ApplyAppMargins>
            <Typography variant="body2" className={classes.shortLinkText}>
              <span className={classes.domainText}>go.gov.sg/</span>
              {selectedUrl?.shortUrl}
            </Typography>
          </ApplyAppMargins>
        </ButtonBase>
        <Divider className={classes.dividerTop} />
        <ApplyAppMargins>
          <>
            <Typography variant="body2" className={classes.descriptionText}>
              {selectedUrl?.description
                ? selectedUrl?.description
                : 'No information available.'}
            </Typography>
            <Divider className={classes.divider} />
            <Typography variant="caption" className={classes.contactEmailText}>
              {selectedUrl?.contactEmail || 'No contact specified'}
            </Typography>
          </>
        </ApplyAppMargins>
      </div>
    </BottomDrawer>
  )
}

export default InfoDrawer
