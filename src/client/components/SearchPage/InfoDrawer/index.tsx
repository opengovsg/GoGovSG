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
import mailIcon from '../assets/mail-icon.svg'

type InfoDrawerProps = {
  onClose: () => void
  selectedUrl?: UrlTypePublic
}

// type InfoDrawerStyleProps = {}

const useStyles = makeStyles((theme) =>
  createStyles({
    shortLinkText: {
      color: theme.palette.text.primary,
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
      color: theme.palette.text.primary,
      fontWeight: 400,
      wordBreak: 'break-all',
    },
    contactEmailPrefixText: {
      color: '#767676',
      marginBottom: theme.spacing(1),
    },
    shortUrlButton: {
      width: '100%',
      justifyContent: 'flex-start',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(6),
    },
    contactEmailLink: {
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    emailIcon: {
      marginRight: theme.spacing(1),
    },
  }),
)

const InfoDrawer: FunctionComponent<InfoDrawerProps> = ({
  onClose,
  selectedUrl,
}: InfoDrawerProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  return (
    <BottomDrawer open={!!selectedUrl} onClose={onClose}>
      <div className={classes.content}>
        <a
          href={
            selectedUrl
              ? `${document.location.protocol}//${document.location.host}/${selectedUrl.shortUrl}`
              : undefined
          }
        >
          <ButtonBase className={classes.shortUrlButton}>
            <ApplyAppMargins>
              <Typography variant="body2" className={classes.shortLinkText}>
                <span className={classes.domainText}>go.gov.sg/</span>
                {selectedUrl?.shortUrl}
              </Typography>
            </ApplyAppMargins>
          </ButtonBase>
        </a>
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
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div>
                  <img
                    src={mailIcon}
                    alt="email"
                    className={classes.emailIcon}
                  />
                </div>
                <div>
                  <div className={classes.contactEmailPrefixText}>
                    For enquiries, contact:
                  </div>
                  <a
                    href={
                      selectedUrl?.contactEmail
                        ? `mailto:${selectedUrl?.contactEmail}`
                        : undefined
                    }
                    className={`${classes.contactEmailText} ${
                      selectedUrl?.contactEmail ? classes.contactEmailLink : ''
                    }`}
                  >
                    {selectedUrl?.contactEmail || '-'}
                  </a>
                </div>
              </div>
            </Typography>
          </>
        </ApplyAppMargins>
      </div>
    </BottomDrawer>
  )
}

export default InfoDrawer
