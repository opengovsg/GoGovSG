import React, { FunctionComponent } from 'react'
import {
  TableCell,
  TableRow,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
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
      [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(5.5),
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
      marginLeft: (props: SearchTableRowStyleProps) => props.appMargins,
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
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        paddingLeft: theme.spacing(28),
        width: '40%',
      },
    },
    contactEmailText: {
      color: '#767676',
      fontWeight: 400,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    contactEmailClickable: {
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
          <span className={classes.domainText}>go.gov.sg/</span>
          {url.shortUrl}
        </Typography>
      </TableCell>
      <TableCell className={classes.descriptionCell} key="descriptionCell">
        <Typography
          color="primary"
          variant="body2"
          className={classes.descriptionText}
        >
          {url.description ? url.description : 'No information available.'}
        </Typography>
      </TableCell>
      <TableCell className={classes.contactEmailCell} key="emailCell">
        <Typography
          variant={isMobileView ? 'caption' : 'body2'}
          className={`${classes.contactEmailText} ${
            url.contactEmail ? classes.contactEmailClickable : ''
          }`}
          onClick={(e) => {
            if (url.contactEmail) {
              window.location.href = `mailto:${url.contactEmail}`
              e.stopPropagation()
            }
          }}
        >
          {url.contactEmail || 'No contact specified'}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default SearchTableRow
