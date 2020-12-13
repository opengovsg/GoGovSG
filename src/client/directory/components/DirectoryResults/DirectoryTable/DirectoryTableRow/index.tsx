import React, { FunctionComponent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import copy from 'copy-to-clipboard'
import {
  Hidden,
  TableCell,
  TableRow,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import { UrlTypePublic } from '../../../../reducers/types'
import useAppMargins from '../../../../../app/components/AppMargins/appMargins'
import personIcon from '../../../../assets/person-icon.svg'
import { SetSuccessMessageAction } from '../../../../../app/components/pages/RootPage/actions/types'
import rootActions from '../../../../../app/components/pages/RootPage/actions'
import DirectoryFileIcon from '../../../../widgets/DirectoryFileIcon'
import DirectoryUrlIcon from '../../../../widgets/DirectoryUrlIcon'
import { GoGovReduxState } from '../../../../../app/reducers/types'
import { GAEvent } from '../../../../../app/util/ga'

type DirectoryTableRowProps = {
  url: UrlTypePublic
  setUrlInfo: (url: UrlTypePublic) => void
  setOpen: (urlInfo: boolean) => void
  index: number
}

type DirectoryTableRowStyleProps = {
  appMargins: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    shortLinkCell: {
      display: 'inline-flex',
      width: '100%',
      paddingBottom: theme.spacing(0.5),
      borderBottom: 'none',
      margin: 0,
      marginLeft: (props: DirectoryTableRowStyleProps) => props.appMargins,
      paddingTop: theme.spacing(4),
      flexDirection: 'column',
      [theme.breakpoints.up('md')]: {
        width: '40%',
        paddingTop: theme.spacing(5.5),
        paddingRight: () => '10%',
        marginLeft: () => 0,
      },
    },
    tableRow: {
      display: 'flex',
      flexWrap: 'wrap',
      border: 'none',
      borderBottom: '1px solid #d8d8d860',
      height: 'fit-content',
      '&:hover': {
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
      },
    },
    shortLinkText: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      maxWidth: '400px',
      [theme.breakpoints.down('sm')]: {
        maxWidth: '200px',
      },
    },
    emailText: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      maxWidth: '400px',
      [theme.breakpoints.down('sm')]: {
        maxWidth: '200px',
      },
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    domainTextInactive: {
      color: '#BBBBBB',
      [theme.breakpoints.up('md')]: {
        maxWidth: '400px',
      },
      [theme.breakpoints.down('sm')]: {
        width: 'calc(100% - 32px)',
      },
    },
    domainTextActive: {
      [theme.breakpoints.up('md')]: {
        maxWidth: '400px',
      },
      [theme.breakpoints.down('sm')]: {
        width: 'calc(100% - 32px)',
      },
    },
    urlInformationCell: {
      width: '100%',
      marginRight: 0,
    },
    contactEmailCell: {
      display: 'inline-flex',
      margin: 0,
      width: '100%',
      border: 'none',
      paddingLeft: (props: DirectoryTableRowStyleProps) => props.appMargins,
      paddingBottom: theme.spacing(4),
      [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(5.5),
        paddingBottom: theme.spacing(0.5),
        paddingLeft: () => 0,
        width: '25%',
        flexDirection: 'column',
      },
    },
    IconCell: {
      display: 'inline-flex',
      verticalAlign: 'middle',
      [theme.breakpoints.up('md')]: {
        paddingRight: theme.spacing(1.5),
        marginLeft: (props: DirectoryTableRowStyleProps) => props.appMargins,
      },
    },
    mailIconCell: {
      [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(5.0),
        paddingLeft: 0,
        paddingRight: theme.spacing(1),
        marginLeft: 0,
        marginRight: 0,
      },
    },
    personIcon: {
      marginRight: 5,
    },
    stateActive: {
      color: '#6d9067',
      textTransform: 'capitalize',
    },
    stateInactive: {
      color: '#c85151',
      textTransform: 'capitalize',
    },
    stateCell: {
      [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(5.5),
        minWidth: '100px',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'inline-flex',
        width: '30%',
        minWidth: '110px',
        paddingLeft: (props: DirectoryTableRowStyleProps) => props.appMargins,
      },
    },
  }),
)

const DirectoryTableRow: FunctionComponent<DirectoryTableRowProps> = ({
  url,
  setUrlInfo,
  setOpen,
  index,
}: DirectoryTableRowProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  const query = useSelector(
    (state: GoGovReduxState) => state.directory.queryForResult,
  )

  const onClickEvent = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
  ) => {
    GAEvent(
      'directory result',
      `${query}`,
      'open tab',
      parseInt(`${index}`, 10),
    )
    if (!isMobileView && url.state === 'ACTIVE') {
      e.stopPropagation()
      const redirect = `${window.location.origin}/${url.shortUrl}`
      window.open(redirect, '_blank', 'noopener noreferrer')
    } else if (isMobileView) {
      setUrlInfo(url)
      setOpen(true)
    }
  }

  const onClickEmail = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    GAEvent(
      'directory result',
      `${query}`,
      'copy email',
      parseInt(`${index}`, 10),
    )
    if (!isMobileView) {
      e.stopPropagation()
      copy(url.email)
      dispatch<SetSuccessMessageAction>(
        rootActions.setSuccessMessage('Email has been copied'),
      )
    }
  }

  return (
    <TableRow
      className={classes.tableRow}
      onClick={(e) => onClickEvent(e)}
      key={url.shortUrl}
    >
      <TableCell className={classes.shortLinkCell} key="shortUrlCell">
        <Typography variant="body2" className={classes.shortLinkText}>
          <div className={classes.IconCell}>
            {url?.isFile ? (
              <DirectoryFileIcon
                color={url?.state === 'ACTIVE' ? '#384A51' : '#BBBBBB'}
              />
            ) : (
              <DirectoryUrlIcon
                color={url?.state === 'ACTIVE' ? '#384A51' : '#BBBBBB'}
              />
            )}
          </div>
          {url.state === 'ACTIVE' ? (
            <>
              <span className={classes.domainTextActive}>/{url.shortUrl}</span>
            </>
          ) : (
            <>
              <span className={classes.domainTextInactive}>
                /{url.shortUrl}
              </span>
            </>
          )}
        </Typography>
      </TableCell>

      <Hidden smDown>
        <TableCell className={classes.stateCell}>
          <Typography
            variant="caption"
            className={
              url.state === 'ACTIVE'
                ? classes.stateActive
                : classes.stateInactive
            }
          >
            <b style={{ fontWeight: 900 }}>{'• '}</b>
            {url.state.toLowerCase()}
          </Typography>
        </TableCell>
      </Hidden>

      <TableCell className={classes.contactEmailCell} key="emailCell">
        <Typography
          variant="body2"
          className={classes.emailText}
          onClick={(e) => onClickEmail(e)}
        >
          <div className={classes.IconCell}>
            <img
              className={classes.personIcon}
              src={personIcon}
              alt="Copy email"
            />
          </div>
          {String(url.email)}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default DirectoryTableRow
