import React, { FunctionComponent } from 'react'
import copy from 'copy-to-clipboard'
import { useDispatch } from 'react-redux'
import {
  Button,
  Divider,
  Drawer,
  Paper,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import personIcon from '@assets/components/directory/directory-results/person-icon.svg'
import copyEmailIcon from '@assets/components/directory/directory-results/copy-email-icon.svg'
import i18next from 'i18next'
import { SetSuccessMessageAction } from '../../../../app/components/pages/RootPage/actions/types'
import rootActions from '../../../../app/components/pages/RootPage/actions'
import useAppMargins from '../../../../app/components/AppMargins/appMargins'
import { UrlTypePublic } from '../../../reducers/types'
import RedirectIcon from '../../../widgets/RedirectIcon'
import DirectoryFileIcon from '../../../widgets/DirectoryFileIcon'
import DirectoryUrlIcon from '../../../widgets/DirectoryUrlIcon'

type MobilePanelProps = {
  isOpen: boolean
  setOpen: (open: boolean) => void
  url: UrlTypePublic
}

const useStyles = makeStyles((theme) =>
  createStyles({
    mobilePanel: {
      padding: theme.spacing(1.5),
    },
    personIcon: {
      marginRight: 5,
    },
    copyIcon: {
      position: 'absolute',
      right: '10%',
      '&:focus': {
        outline: 'none',
      },
    },
    goToIcon: {
      position: 'absolute',
      right: '10%',
    },
    row: {
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    divider: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    shortUrlRow: {
      display: 'box',
      maxWidth: '200px',
      width: '100%',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    shortUrlInActive: {
      color: '#BBBBBB',
    },
    longLinkText: {
      color: '#BBBBBB',
    },
    stateIcon: {
      verticalAlign: 'middle',
    },
    stateActive: {
      color: '#6d9067',
      textTransform: 'capitalize',
      padding: theme.spacing(3),
    },
    stateInactive: {
      color: '#c85151',
      textTransform: 'capitalize',
      padding: theme.spacing(3),
    },
  }),
)
/**
 * @component Popup drawer for mobile view.
 */
const MobilePanel: FunctionComponent<MobilePanelProps> = ({
  isOpen,
  setOpen,
  url,
}: MobilePanelProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const dispatch = useDispatch()

  const onCopyEmail = () => {
    copy(url.email)
    dispatch<SetSuccessMessageAction>(
      rootActions.setSuccessMessage('Email has been copied'),
    )
  }

  // inactive and active icons/ colors
  const getMobileIcon = () => {
    if (url?.state === 'ACTIVE' && url?.isFile) {
      return (
        <>
          <DirectoryFileIcon className={classes.stateIcon} />
          <div>
            <span>/{url?.shortUrl}</span>
            <br />
            <p className={classes.longLinkText}>{url?.longUrl}</p>
          </div>
        </>
      )
    }
    if (url?.state === 'ACTIVE' && !url?.isFile) {
      return (
        <>
          <DirectoryUrlIcon className={classes.stateIcon} />
          <div>
            <span>/{url?.shortUrl}</span>
            <br />
            <p className={classes.longLinkText}>{url?.longUrl}</p>
          </div>
        </>
      )
    }
    if (url?.isFile) {
      return (
        <>
          <DirectoryFileIcon className={classes.stateIcon} color="#BBBBBB" />
          <div>
            <span className={classes.shortUrlInActive}>/{url?.shortUrl}</span>
            <br />
            <p className={classes.longLinkText}>{url?.longUrl}</p>
          </div>
        </>
      )
    }

    return (
      <>
        <DirectoryUrlIcon className={classes.stateIcon} color="#BBBBBB" />
        <div>
          <span className={classes.shortUrlInActive}>/{url?.shortUrl}</span>
          <br />
          <p className={classes.longLinkText}>{url?.longUrl}</p>
        </div>
      </>
    )
  }

  return (
    <Drawer
      anchor="bottom"
      open={isOpen}
      onBackdropClick={() => setOpen(false)}
      onEscapeKeyDown={() => setOpen(false)}
    >
      <Paper className={classes.mobilePanel}>
        <Typography className={classes.row} variant="body2">
          <div className={classes.shortUrlRow}>
            {getMobileIcon()}
            {url?.state === 'ACTIVE' && (
              <a href={url?.shortUrl} target="_blank" rel="noopener noreferrer">
                <RedirectIcon className={classes.goToIcon} />
              </a>
            )}
          </div>
        </Typography>
        <Typography
          variant="caption"
          className={
            url?.state === 'ACTIVE'
              ? classes.stateActive
              : classes.stateInactive
          }
        >
          <b style={{ fontWeight: 900 }}>{'• '}</b>
          {url?.state.toLowerCase()}
        </Typography>
        <Divider className={classes.divider} />
        <Typography className={classes.row} variant="body2">
          <img
            className={classes.personIcon}
            src={personIcon}
            alt="person icon"
          />
          {url?.email}
          <input
            type="image"
            src={copyEmailIcon}
            onClick={onCopyEmail}
            className={classes.copyIcon}
            alt="email icon"
          />
        </Typography>
        <Divider className={classes.divider} />
        <Typography className={classes.row} variant="body2">
          <Button
            href={i18next.t('general.links.contact')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Request ownership
          </Button>
        </Typography>
      </Paper>
    </Drawer>
  )
}

export default MobilePanel
