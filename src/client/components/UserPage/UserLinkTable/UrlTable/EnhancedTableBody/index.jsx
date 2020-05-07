import React, { useState } from 'react'
import 'boxicons'
import copy from 'copy-to-clipboard'
import PropTypes from 'prop-types'
import { connect, useSelector } from 'react-redux'

import {
  IconButton,
  Switch,
  TableBody,
  TableCell,
  TableRow,
} from '@material-ui/core'
import { createStyles, fade, makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

import GoTooltip from './templates/GoTooltip'
import userActions from '../../../../../actions/user'
import EditableTextField from './EditableTextField'
import { removeHttpsProtocol } from '../../../../../util/url'
import useAppMargins from '../../../../AppMargins/useAppMargins'

const mapDispatchToProps = (dispatch) => ({
  openOwnershipModal: (shortUrl) =>
    dispatch(userActions.openOwnershipModal(shortUrl)),
  toggleUrlState: (shortUrl, state) =>
    dispatch(userActions.toggleUrlState(shortUrl, state)),
  onSaveUrl: (shortUrl, longUrl, editedLongUrl) => {
    if (removeHttpsProtocol(longUrl) === editedLongUrl) {
      dispatch(userActions.cancelEditLongUrl())
    } else {
      dispatch(userActions.updateLongUrl(shortUrl, editedLongUrl))
    }
  },
  setEditedLongUrl: (shortUrl, editedLongUrl) => {
    dispatch(userActions.setEditedLongUrl(shortUrl, editedLongUrl))
  },
  openQrCode: (shortUrl) => dispatch(userActions.openQrCode(shortUrl)),
})

const useStyles = makeStyles((theme) => {
  return createStyles({
    bar: {
      backgroundColor: theme.palette.grey[500],
    },
    leftCell: {
      [theme.breakpoints.up('md')]: {
        textAlign: 'left',
        paddingLeft: (props) => props.appMargins,
      },
    },
    rightCell: {
      [theme.breakpoints.up('md')]: {
        textAlign: 'right',
        paddingRight: (props) => props.appMargins,
      },
    },
    iconButton: {
      padding: '0px',
    },
    editableTextField: {
      minWidth: '25vw',
    },
    shortBtn: {
      display: 'block',
      color: 'black',
    },
    shortBtnLabel: {
      fontWeight: '400',
      textAlign: 'left',
    },
    tableBodyTitle: {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        display: 'inline-block',
        margin: 'auto 0',
        padding: theme.spacing(0, 1, 0, 10),
        width: '30%',
        fontSize: '0.75em',
      },
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(0, 1, 0, 2),
      },
    },
    hoverRow: {
      '&:hover': {
        backgroundColor: fade(theme.palette.common.black, 0.1),
      },
    },
  })
})

const EnhancedTableBody = ({
  openOwnershipModal,
  toggleUrlState,
  onSaveUrl,
  setEditedLongUrl,
  openQrCode,
}) => {
  const urls = useSelector((state) => state.user.urls)
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })

  // Used to manage tooltip descriptions for our short url anchor button.
  const [isCopied, setCopied] = useState(false)
  const copiedLinkIconDesc = 'Link copied'

  if (urls.length > 0) {
    // Text descriptions of icons buttons in user url table body.
    // Used for tooltips and aria labels.
    const transferIconDesc = 'Transfer link'
    const copyLinkIconDesc = 'Copy link'
    const qrCodeIconDesc = 'Download QR Code'

    // If user has existing links, show the user's list of stored links.
    return (
      <TableBody>
        {urls.map((row) => (
          <TableRow key={row.shortUrl} className={classes.hoverRow}>
            <TableCell className={classes.tableBodyTitle}>Owner</TableCell>
            <TableCell className={classes.leftCell}>
              <GoTooltip title={transferIconDesc}>
                <IconButton
                  className={classes.iconButton}
                  color="inherit"
                  aria-label={transferIconDesc}
                  onClick={() => openOwnershipModal(row.shortUrl)}
                >
                  <box-icon name="user" />
                </IconButton>
              </GoTooltip>
            </TableCell>
            <TableCell className={classes.tableBodyTitle}>
              Original URL
            </TableCell>
            <TableCell className={classes.editableTextField}>
              <EditableTextField
                editedLongUrl={row.editedLongUrl}
                shortUrl={row.shortUrl}
                originalLongUrl={row.longUrl}
                onSaveUrl={onSaveUrl}
                setEditedLongUrl={setEditedLongUrl}
                classes={classes}
              />
            </TableCell>
            <TableCell className={classes.tableBodyTitle}>Short URL</TableCell>
            <TableCell>
              <GoTooltip
                title={isCopied ? copiedLinkIconDesc : copyLinkIconDesc}
                onClose={() => {
                  // Sets the link as not copied. Sets tooltip accordingly.
                  // Short timeout to prevent tooltip changes on close.
                  setTimeout(() => setCopied(false), 100)
                }}
              >
                <Button
                  className={classes.shortBtn}
                  classes={{ label: classes.shortBtnLabel }}
                  color="primary"
                  onClick={() => {
                    copy(
                      `${document.location.protocol}//${document.location.host}/${row.shortUrl}`,
                    )
                    // Sets the link as copied. Changes tooltip accordingly.
                    setCopied(true)
                  }}
                >
                  {`/${row.shortUrl}`}
                </Button>
              </GoTooltip>
            </TableCell>
            <TableCell className={classes.tableBodyTitle}>QR</TableCell>
            <TableCell>
              <GoTooltip title={qrCodeIconDesc}>
                <IconButton
                  className={classes.iconButton}
                  color="secondary"
                  aria-label={qrCodeIconDesc}
                  onClick={() => openQrCode(row.shortUrl)}
                >
                  <box-icon name="scan" />
                </IconButton>
              </GoTooltip>
            </TableCell>
            <TableCell className={classes.tableBodyTitle}>
              Last Modified
            </TableCell>
            <TableCell>{row.updatedAt}</TableCell>
            <TableCell className={classes.tableBodyTitle}>Visits</TableCell>
            <TableCell>{row.clicks}</TableCell>
            <TableCell className={classes.tableBodyTitle}>Status</TableCell>
            <TableCell className={classes.rightCell}>
              <Switch
                color="primary"
                checked={row.state === 'ACTIVE'}
                onChange={() => toggleUrlState(row.shortUrl, row.state)}
                value={row.state}
                classes={{
                  track: classes.bar,
                }}
              />
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
      </TableRow>
    </TableBody>
  )
}

EnhancedTableBody.propTypes = {
  openOwnershipModal: PropTypes.func.isRequired,
  toggleUrlState: PropTypes.func.isRequired,
  onSaveUrl: PropTypes.func.isRequired,
  setEditedLongUrl: PropTypes.func.isRequired,
  openQrCode: PropTypes.func.isRequired,
}

export default connect(null, mapDispatchToProps)(EnhancedTableBody)
