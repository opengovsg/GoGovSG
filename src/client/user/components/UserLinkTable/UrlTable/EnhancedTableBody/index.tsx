import React from 'react'
import { useSelector } from 'react-redux'
import {
  Grid,
  Hidden,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import linkIcon from '@assets/components/user/user-link-table/link-icon.svg'
import fileIcon from '@assets/components/user/user-link-table/file-icon.svg'
import clickCountIcon from '@assets/components/user/user-link-table/click-count-icon.svg'

import TableTag from './TableTag'
import useAppMargins from '../../../../../app/components/AppMargins/appMargins'
import { DrawerActions } from '../../../Drawer/ControlPanel/util/reducers'
import { useDrawerDispatch } from '../../../Drawer'
import { numberUnitFormatter } from '../../../../../app/util/format'
import CopyButton from '../../../../widgets/CopyButton'

type StyleProps = {
  appMargins: number
}

const useStyles = makeStyles((theme) => {
  return createStyles({
    bar: {
      backgroundColor: theme.palette.grey[500],
    },
    root: {
      '&:first-child': {
        borderTop: 'non',
        [theme.breakpoints.up('md')]: {
          borderTop: '1px solid #d8d8d860',
        },
      },
      borderBottom: '1px solid #d8d8d8',
      [theme.breakpoints.up('md')]: {
        borderBottom: 'none',
      },
    },
    leftCell: {
      [theme.breakpoints.up('md')]: {
        textAlign: 'end',
        paddingTop: '0px',
        paddingRight: theme.spacing(1.5),
        paddingLeft: (props: StyleProps) => props.appMargins,
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    leftCellWithTags: {
      [theme.breakpoints.up('md')]: {
        textAlign: 'end',
        paddingTop: '0px',
        paddingRight: theme.spacing(1.5),
        paddingBottom: '61px',
        paddingLeft: (props: StyleProps) => props.appMargins,
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    urlCell: {
      paddingTop: theme.spacing(3),
      [theme.breakpoints.up('md')]: {
        width: '61%',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'inline-flex',
        width: '100%',
        padding: theme.spacing(2, 2, 0, 3),
        paddingLeft: (props: StyleProps) => props.appMargins,
      },
    },
    shortUrlGrid: {
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    longUrlGrid: {
      padding: theme.spacing(1, 0, 0.5, 0),
    },
    stateCell: {
      [theme.breakpoints.up('md')]: {
        minWidth: '100px',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'inline-flex',
        padding: theme.spacing(1, 2, 2, 3),
        width: '30%',
        minWidth: '110px',
        paddingLeft: (props: StyleProps) => props.appMargins,
      },
    },
    createdAtCell: {
      [theme.breakpoints.up('md')]: {
        minWidth: '125px',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'inline-flex',
        padding: theme.spacing(1, 1, 2, 1),
        width: '25%',
        minWidth: '100px',
      },
    },
    clicksCell: {
      paddingRight: (props: StyleProps) => props.appMargins,
      [theme.breakpoints.up('md')]: {
        minWidth: '210px',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'inline-flex',
        padding: theme.spacing(1, 0, 2, 2),
        width: '40%',
        minWidth: '100px',
      },
    },
    clicksCellContent: {
      width: 118,
    },
    clicksCellTooltipContent: {
      display: 'inline-block',
    },
    rightCell: {
      [theme.breakpoints.up('md')]: {
        textAlign: 'right',
        paddingRight: (props: StyleProps) => props.appMargins,
      },
    },
    icon: {
      marginTop: theme.spacing(-0.5),
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    stateActive: {
      color: '#6d9067',
      textTransform: 'capitalize',
    },
    stateInactive: {
      color: '#c85151',
      textTransform: 'capitalize',
    },
    shortUrl: {
      [theme.breakpoints.up('md')]: {
        maxWidth: '400px',
      },
      [theme.breakpoints.down('sm')]: {
        width: 'calc(100% - 32px)',
      },
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    longUrl: {
      color: '#767676',
    },
    createdAt: {
      color: '#767676',
    },
    clicksIcon: {
      verticalAlign: 'middle',
    },
    clicksText: {
      color: '#767676',
      paddingLeft: '4px',
    },
    hoverRow: {
      [theme.breakpoints.down('sm')]: {
        height: 'auto',
        borderBottom: 'none',
        borderRight: 'none',
        borderLeft: 'none',
      },
      '&:hover': {
        backgroundColor: theme.palette.background.default,
        cursor: 'pointer',
      },
    },
    lastCreatedRow: {
      backgroundColor: theme.palette.background.default,
    },
  })
})

export default function EnhancedTableBody() {
  const urls: any[] = useSelector((state: any) => state.user.urls)
  const lastCreatedLink = useSelector(
    (state: any) => state.user.lastCreatedLink,
  )
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const drawerDispatch = useDrawerDispatch()
  const openControlPanel = (shortlink: string) =>
    drawerDispatch({ type: DrawerActions.openControlPanel, payload: shortlink })

  const applySearchByTag = (tag: string) => {
    // TODO: apply searching by tag
    console.log(tag)
    // dispatch(userActions.isFetchingUrls(true))
    // dispatch(
    //   userActions.setUrlTableConfig({
    //     searchText: tag,
    //     pageNumber: 0,
    //   } as UrlTableConfig),
    // )
    // dispatch(userActions.getUrlsForUser())
  }

  if (urls.length > 0) {
    // If user has existing links, show the user's list of stored links.
    return (
      <TableBody classes={{ root: classes.root }}>
        {urls.map((row) => (
          <TableRow
            key={row.shortUrl}
            className={`${classes.hoverRow} ${
              lastCreatedLink === row.shortUrl ? classes.lastCreatedRow : ''
            }`}
            onClick={() => openControlPanel(row.shortUrl)}
          >
            <TableCell
              className={
                row.tags.length > 0
                  ? classes.leftCellWithTags
                  : classes.leftCell
              }
            >
              <img
                className={classes.icon}
                src={row.isFile ? fileIcon : linkIcon}
                alt={row.isFile ? 'File' : 'Link'}
              />
            </TableCell>
            <TableCell align="left" className={classes.urlCell}>
              <Grid container direction="column">
                <Grid item className={classes.shortUrlGrid}>
                  <Tooltip title={row.shortUrl} placement="top-start" arrow>
                    <Typography variant="h6" className={classes.shortUrl}>
                      /{row.shortUrl}
                    </Typography>
                  </Tooltip>
                </Grid>
                <Hidden smDown>
                  <Grid item className={classes.longUrlGrid}>
                    <Typography variant="caption" className={classes.longUrl}>
                      {row.longUrl}
                    </Typography>
                  </Grid>
                </Hidden>
                {row.tags.length > 0 && (
                  <Hidden smDown>
                    <Grid item className={classes.longUrlGrid}>
                      {row.tags.map((tag: string) => (
                        <TableTag
                          key={tag}
                          tag={tag}
                          onClick={() => applySearchByTag(tag)}
                        />
                      ))}
                    </Grid>
                  </Hidden>
                )}
              </Grid>
            </TableCell>
            <Hidden smDown>
              <TableCell className={classes.stateCell}>
                <CopyButton
                  shortUrl={row.shortUrl}
                  buttonText="Copy"
                  iconSize={13}
                  variant="caption"
                  stopPropagation
                />
              </TableCell>
            </Hidden>
            <TableCell className={classes.stateCell}>
              <Typography
                variant="caption"
                className={
                  row.state === 'ACTIVE'
                    ? classes.stateActive
                    : classes.stateInactive
                }
              >
                <b style={{ fontWeight: 900 }}>{'• '}</b>
                {row.state.toLowerCase()}
              </Typography>
            </TableCell>
            <TableCell className={classes.createdAtCell}>
              <Typography variant="caption" className={classes.createdAt}>
                {row.createdAt}
              </Typography>
            </TableCell>
            <TableCell className={classes.clicksCell}>
              <div className={classes.clicksCellContent}>
                <Tooltip title={row.clicks} placement="top" arrow>
                  <div className={classes.clicksCellTooltipContent}>
                    <img
                      className={classes.clicksIcon}
                      src={clickCountIcon}
                      alt="Clicks"
                    />
                    <Typography
                      variant="caption"
                      className={classes.clicksText}
                    >
                      {numberUnitFormatter(row.clicks)}
                    </Typography>
                  </div>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    )
  }
  // To return if user does not have any existing links.
  return (
    <TableBody>
      <TableRow>
        <TableCell className={classes.leftCell}>No links found</TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell className={classes.rightCell} />
      </TableRow>
    </TableBody>
  )
}
