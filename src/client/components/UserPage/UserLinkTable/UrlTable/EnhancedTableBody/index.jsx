import React from 'react'
import 'boxicons'
// import PropTypes from 'prop-types'
import { connect, useSelector } from 'react-redux'

import {
  Grid,
  Hidden,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'

import useAppMargins from '../../../../AppMargins/useAppMargins'
import DrawerActions from '../../../Drawer/ControlPanel/helpers/reducers'
import { useDrawerDispatch } from '../../../Drawer'
import { numberUnitFormatter } from '../../../../../util/format'

const mapDispatchToProps = (/* dispatch */) => ({
  // openOwnershipModal: (shortUrl) =>
  //   dispatch(userActions.openOwnershipModal(shortUrl)),
  // toggleUrlState: (shortUrl, state) =>
  //   dispatch(userActions.toggleUrlState(shortUrl, state)),
  // onSaveUrl: (shortUrl, longUrl, editedLongUrl) => {
  //   if (removeHttpsProtocol(longUrl) === editedLongUrl) {
  //     dispatch(userActions.cancelEditLongUrl())
  //   } else {
  //     dispatch(userActions.updateLongUrl(shortUrl, editedLongUrl))
  //   }
  // },
  // setEditedLongUrl: (shortUrl, editedLongUrl) => {
  //   dispatch(userActions.setEditedLongUrl(shortUrl, editedLongUrl))
  // },
  // openQrCode: (shortUrl) => dispatch(userActions.openQrCode(shortUrl)),
})

const useStyles = makeStyles((theme) => {
  return createStyles({
    bar: {
      backgroundColor: theme.palette.grey[500],
    },
    leftCell: {
      [theme.breakpoints.up('md')]: {
        textAlign: 'end',
        paddingTop: '0px',
        paddingRight: '12px',
        paddingLeft: (props) => props.appMargins,
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    urlCell: {
      paddingTop: '24px',
      [theme.breakpoints.up('xl')]: {
        width: '65%',
      },
      [theme.breakpoints.up('lg')]: {
        width: '60%',
      },
      [theme.breakpoints.up('md')]: {
        width: '50%',
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        padding: theme.spacing(2, 2, 0, 3),
      },
    },
    shortUrlGrid: {
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    longUrlGrid: {
      padding: theme.spacing(1, 0, 1, 0),
    },
    stateCell: {
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1, 2, 2, 3),
        width: 'max(100px, 30%)',
      },
    },
    updatedAtCell: {
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1, 1, 2, 1),
        width: 'max(100px, 35%)',
      },
    },
    clicksCell: {
      paddingRight: (props) => props.appMargins,
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1, 1, 2, 2),
        width: 'max(100px, 20%)',
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
      marginTop: '-4px',
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
        border: 'solid 0.25px rgba(0, 0, 0, 0.15)',
      },
      '&:hover': {
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
      },
    },
  })
})

const EnhancedTableBody = (/* {
  openOwnershipModal,
  toggleUrlState,
  onSaveUrl,
  setEditedLongUrl,
  openQrCode,
} */) => {
  const urls = useSelector((state) => state.user.urls)
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })

  // Used to manage tooltip descriptions for our short url anchor button.
  // const [isCopied, setCopied] = useState(false)
  // const copiedLinkIconDesc = 'Link copied'

  const dispatch = useDrawerDispatch()
  const openControlPanel = (shortlink) =>
    dispatch({ type: DrawerActions.openControlPanel, payload: shortlink })

  if (urls.length > 0) {
    // Text descriptions of icons buttons in user url table body.
    // Used for tooltips and aria labels.
    // const transferIconDesc = 'Transfer link'
    // const copyLinkIconDesc = 'Copy link'
    // const qrCodeIconDesc = 'Download QR Code'

    // If user has existing links, show the user's list of stored links.
    return (
      <TableBody>
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

EnhancedTableBody.propTypes = {
  // openOwnershipModal: PropTypes.func.isRequired,
  // toggleUrlState: PropTypes.func.isRequired,
  // onSaveUrl: PropTypes.func.isRequired,
  // setEditedLongUrl: PropTypes.func.isRequired,
  // openQrCode: PropTypes.func.isRequired,
}

export default connect(null, mapDispatchToProps)(EnhancedTableBody)
