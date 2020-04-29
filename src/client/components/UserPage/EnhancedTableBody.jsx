import React, { useState } from 'react'
import 'boxicons'
import copy from 'copy-to-clipboard'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  IconButton,
  Switch,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

import userActions from '~/actions/user'
import EditableTextField from './EditableTextField'
import { removeHttpsProtocol } from '~/util/url'
import userPageStyle from '~/styles/userPage'

const mapStateToProps = (state) => ({
  urls: state.user.urls,
})

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

const EnhancedTableBody = ({
  classes,
  urls,
  openOwnershipModal,
  toggleUrlState,
  onSaveUrl,
  setEditedLongUrl,
  openQrCode,
}) => {
  if (urls.length > 0) {
    // Text descriptions of icons buttons in user url table body.
    // Used for tooltips and aria labels.
    const transferIconDesc = 'Transfer link'
    const copyLinkIconDesc = 'Copy link'
    const qrCodeIconDesc = 'Download QR Code'

    // Used to manage tooltip descriptions for our short url anchor button.
    const [isCopied, setCopied] = useState(false)
    const copiedLinkIconDesc = 'Link copied'

    // If user has existing links, show the user's list of stored links.
    return (
      <TableBody>
        {urls.map((row) => (
          <TableRow key={row.shortUrl} className={classes.hoverRow}>
            <TableCell className={classes.tableBodyTitle}>Owner</TableCell>
            <TableCell align="center" className={classes.leftCell}>
              <Tooltip title={transferIconDesc} arrow placement="top">
                <IconButton
                  className={classes.iconButton}
                  color="inherit"
                  aria-label={transferIconDesc}
                  onClick={() => openOwnershipModal(row.shortUrl)}
                >
                  <box-icon name="user" />
                </IconButton>
              </Tooltip>
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
              <Tooltip
                title={isCopied ? copiedLinkIconDesc : copyLinkIconDesc}
                onClose={() => {
                  // Sets the link as not copied. Sets tooltip accordingly.
                  // Short timeout to prevent tooltip changes on close.
                  setTimeout(() => setCopied(false), 100)
                }}
                arrow
                placement="top"
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
              </Tooltip>
            </TableCell>
            <TableCell className={classes.tableBodyTitle}>QR</TableCell>
            <TableCell>
              <Tooltip title={qrCodeIconDesc} arrow placement="top">
                <IconButton
                  className={classes.iconButton}
                  color="secondary"
                  aria-label={qrCodeIconDesc}
                  onClick={() => openQrCode(row.shortUrl)}
                >
                  <box-icon name="scan" />
                </IconButton>
              </Tooltip>
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
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
      </TableRow>
    </TableBody>
  )
}

EnhancedTableBody.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  urls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  openOwnershipModal: PropTypes.func.isRequired,
  toggleUrlState: PropTypes.func.isRequired,
  onSaveUrl: PropTypes.func.isRequired,
  setEditedLongUrl: PropTypes.func.isRequired,
  openQrCode: PropTypes.func.isRequired,
}

export default withStyles(userPageStyle)(
  connect(mapStateToProps, mapDispatchToProps)(EnhancedTableBody),
)
