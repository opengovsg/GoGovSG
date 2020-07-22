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
      maxWidth: (props: SearchTableRowStyleProps) =>
        `calc(100vw - ${props.appMargins}px * 2)`,
      marginLeft: (props: SearchTableRowStyleProps) => props.appMargins,
      paddingTop: theme.spacing(4),
      flexDirection: 'column',
      [theme.breakpoints.up('md')]: {
        width: '50%',
        paddingTop: theme.spacing(5.5),
      },
      [theme.breakpoints.up(1440)]: {
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
        paddingRight: () => 0,
        paddingLeft: () => '10%',
        width: '40%',
        flexDirection: 'column',
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
    <TableRow
      className={classes.tableRow}
      onClick={() => onClickUrl(url.shortUrl)}
      key={url.shortUrl}
    >
      <TableCell className={classes.shortLinkCell} key="shortUrlCell">
        <Typography
          variant={isMobileView ? 'body2' : 'h5'}
          className={classes.shortLinkText}
        >
          <span className={classes.domainText}>{document.location.host}/</span>
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
  )
}

export default SearchTableRow
