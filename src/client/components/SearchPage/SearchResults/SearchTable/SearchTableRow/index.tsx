import React, { FunctionComponent } from 'react'
import {
  TableCell,
  TableRow,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
  Hidden,
} from '@material-ui/core'
import { UrlTypePublic } from '../../../../../reducers/search/types'
import useAppMargins from '../../../../AppMargins/appMargins'
import linkIcon from '../../../../../assets/icons/link-icon.svg'
import fileIcon from '../../../../../assets/icons/file-icon.svg'
import mailIcon from '../../../assets/mail-icon.svg'

type SearchTableRowProps = {
  url: UrlTypePublic
  onClickUrl: (shortUrl: string) => void
}

type SearchTableRowStyleProps = {
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
      marginLeft: (props: SearchTableRowStyleProps) => props.appMargins,
      paddingTop: theme.spacing(4),
      flexDirection: 'column',
      [theme.breakpoints.up('md')]: {
        width: '55%',
        paddingTop: theme.spacing(5.5),
        paddingRight: () => '10%',
        marginLeft: () => 0,
      },
      [theme.breakpoints.up('lg')]: {
        width: '60%',
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
    },
    domainText: {
      color: '#8CA6AD',
    },
    urlInformationCell: {
      width: '100%',
      marginRight: 0,
    },
    descriptionCell: {
      display: 'inline-flex',
      marginTop: theme.spacing(2),
      height: theme.spacing(5),
      border: 'none',
      padding: 0,
      width: '100%',
      boxSizing: 'border-box',
      marginRight: (props: SearchTableRowStyleProps) => props.appMargins,
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(6),
        marginRight: 0,
        width: '44%',
      },
    },
    descriptionText: {
      color: '#384a51',
      fontWeight: 400,
      width: '100%',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      wordBreak: 'keep-all',
      height: theme.spacing(5),
      marginTop: theme.spacing(2.5),
      [theme.breakpoints.up('md')]: {
        WebkitLineClamp: 3,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(3.5),
        height: theme.spacing(7.5),
        marginLeft: () => 0,
      },
    },
    contactEmailCell: {
      display: 'inline-flex',
      margin: 0,
      width: '100%',
      border: 'none',
      paddingRight: (props: SearchTableRowStyleProps) => props.appMargins,
      paddingLeft: (props: SearchTableRowStyleProps) => props.appMargins,
      paddingBottom: theme.spacing(4),
      [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(5.5),
        paddingBottom: theme.spacing(0.5),
        paddingLeft: () => 0,
        width: '29%',
        flexDirection: 'column',
      },
      [theme.breakpoints.up('lg')]: {
        width: '25%',
      },
    },
    contactEmailText: {
      color: '#767676',
      fontWeight: 400,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    contactEmailLink: {
      color: '#767676',
    },
    contactEmailClickable: {
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(1),
      },
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    linkIconCell: {
      [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(5.5),
        paddingRight: theme.spacing(1.5),
        marginLeft: (props: SearchTableRowStyleProps) => props.appMargins,
      },
    },
    mailIconCell: {
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(0.25),
        paddingTop: theme.spacing(5.5),
        paddingLeft: 0,
        paddingRight: theme.spacing(1),
        marginLeft: 0,
        marginRight: 0,
      },
    },
  }),
)

const SearchTableRow: FunctionComponent<SearchTableRowProps> = ({
  url,
  onClickUrl,
}: SearchTableRowProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <a
      href={
        isMobileView
          ? undefined
          : `${document.location.protocol}//${document.location.host}/${url.shortUrl}`
      }
    >
      <TableRow
        className={classes.tableRow}
        onClick={() => onClickUrl(url.shortUrl)}
        key={url.shortUrl}
      >
        <Hidden smDown>
          <TableCell className={classes.linkIconCell}>
            <img
              src={url.isFile ? fileIcon : linkIcon}
              alt={url.isFile ? 'File' : 'Link'}
            />
          </TableCell>
        </Hidden>
        <TableCell className={classes.shortLinkCell} key="shortUrlCell">
          <Typography
            variant={isMobileView ? 'body2' : 'h5'}
            className={classes.shortLinkText}
          >
            <span className={classes.domainText}>
              {document.location.host}/
            </span>
            {url.shortUrl}
          </Typography>
          <Typography
            color="primary"
            variant="body2"
            className={classes.descriptionText}
          >
            {url.description ? url.description : 'No information available.'}
          </Typography>
        </TableCell>

        <Hidden smDown>
          <TableCell className={classes.mailIconCell}>
            <img src={mailIcon} alt={'mail'} />
          </TableCell>
        </Hidden>
        <TableCell className={classes.contactEmailCell} key="emailCell">
          <Hidden smDown>
            <Typography variant="body2" className={classes.contactEmailText}>
              For enquiries, contact:
            </Typography>
          </Hidden>
          <Typography
            variant={isMobileView ? 'caption' : 'body2'}
            className={`${classes.contactEmailText} ${
              url.contactEmail ? classes.contactEmailClickable : ''
            }`}
            onClick={(e) => {
              if (url.contactEmail) {
                e.stopPropagation()
              }
            }}
          >
            <a
              href={url.contactEmail ? `mailto:${url.contactEmail}` : undefined}
              className={classes.contactEmailLink}
            >
              {url.contactEmail || '-'}
            </a>
          </Typography>
        </TableCell>
      </TableRow>
    </a>
  )
}

export default SearchTableRow
