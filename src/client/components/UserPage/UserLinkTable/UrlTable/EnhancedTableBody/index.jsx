import React from 'react'
import { useSelector } from 'react-redux'
import {
  Grid,
  Hidden,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'

import useAppMargins from '../../../../AppMargins/appMargins'
import DrawerActions from '../../../Drawer/ControlPanel/helpers/reducers'
import { useDrawerDispatch } from '../../../Drawer'
import { numberUnitFormatter } from '../../../../../util/format'

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
        paddingLeft: (props) => props.appMargins,
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
        width: '100%',
        padding: theme.spacing(2, 2, 0, 3),
        paddingLeft: (props) => props.appMargins,
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
        padding: theme.spacing(1, 2, 2, 3),
        width: '30%',
        minWidth: '110px',
        paddingLeft: (props) => props.appMargins,
      },
    },
    updatedAtCell: {
      [theme.breakpoints.up('md')]: {
        minWidth: '125px',
      },
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1, 1, 2, 1),
        width: '35%',
        minWidth: '100px',
      },
    },
    clicksCell: {
      paddingRight: (props) => props.appMargins,
      [theme.breakpoints.up('md')]: {
        minWidth: '180px',
      },
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1, 1, 2, 2),
        width: '20%',
        minWidth: '100px',
      },
    },
    rightCell: {
      [theme.breakpoints.up('md')]: {
        textAlign: 'right',
        paddingRight: (props) => props.appMargins,
      },
    },
    icon: {
      width: '18px',
      fontSize: '18px',
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
      width: 'calc(100% - 32px)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    longUrl: {
      color: '#767676',
    },
    updatedAt: {
      color: '#767676',
    },
    clicksIcon: {
      width: '13px',
      display: 'inline-block',
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
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
      },
    },
  })
})

export default function EnhancedTableBody() {
  const urls = useSelector((state) => state.user.urls)
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const dispatch = useDrawerDispatch()
  const openControlPanel = (shortlink) =>
    dispatch({ type: DrawerActions.openControlPanel, payload: shortlink })

  if (urls.length > 0) {
    // If user has existing links, show the user's list of stored links.
    return (
      <TableBody classes={{ root: classes.root }}>
        {urls.map((row) => (
          <TableRow
            key={row.shortUrl}
            className={classes.hoverRow}
            onClick={() => openControlPanel(row.shortUrl)}
          >
            <TableCell className={classes.leftCell} width="5%">
              <div className={classes.icon}>
                <box-icon
                  size="cssSize"
                  name={row.isFile ? 'file-blank' : 'link-alt'}
                  color="#384a51"
                />
              </div>
            </TableCell>
            <TableCell align="left" className={classes.urlCell}>
              <Grid container direction="column">
                <Grid item className={classes.shortUrlGrid}>
                  <Typography variant="h6" className={classes.shortUrl}>
                    /{row.shortUrl}
                  </Typography>
                </Grid>
                <Hidden smDown>
                  <Grid item className={classes.longUrlGrid}>
                    <Typography variant="caption" className={classes.longUrl}>
                      {row.longUrl}
                    </Typography>
                  </Grid>
                </Hidden>
              </Grid>
            </TableCell>
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
            <TableCell className={classes.updatedAtCell}>
              <Typography variant="caption" className={classes.updatedAt}>
                {row.updatedAt}
              </Typography>
            </TableCell>
            <TableCell className={classes.clicksCell}>
              <div className={classes.clicksIcon}>
                <box-icon name="bar-chart-alt" size="cssSize" color="#384a51" />
              </div>
              <Typography variant="caption" className={classes.clicksText}>
                {numberUnitFormatter(row.clicks)}
              </Typography>
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
