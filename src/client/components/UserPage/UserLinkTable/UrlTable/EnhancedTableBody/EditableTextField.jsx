import React from 'react'
import { InputAdornment, TextField } from '@material-ui/core'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { isValidLongUrl } from '../../../../../../shared/util/validation'

import { removeHttpsProtocol } from '~/util/url'
import userPageStyle from '~/styles/userPage'

const editedLongUrlAreEqual = (prev, next) =>
  prev.editedLongUrl === next.editedLongUrl

const EditableTextField = React.memo(
  ({
    editedLongUrl,
    shortUrl,
    originalLongUrl,
    onSaveUrl,
    setEditedLongUrl,
    classes,
  }) => {
    let saveUrl = true

    return (
      <TextField
        key={shortUrl}
        required
        variant="filled"
        fullWidth
        value={editedLongUrl}
        onChange={(e) => {
          setEditedLongUrl(shortUrl, e.target.value)
        }}
        onFocus={(e) => {
          setEditedLongUrl(shortUrl, e.target.value)
        }}
        onBlur={() => {
          if (saveUrl) {
            onSaveUrl(shortUrl, originalLongUrl, editedLongUrl)
          }
        }}
        onKeyDown={(e) => {
          switch (e.key) {
            case 'Escape':
              saveUrl = false
              e.target.value = removeHttpsProtocol(originalLongUrl)
              setEditedLongUrl(shortUrl, removeHttpsProtocol(originalLongUrl))
              break
            case 'Enter':
              break
            default:
              return
          }
          e.target.blur()
          e.preventDefault()
        }}
        error={!isValidLongUrl(editedLongUrl, true)}
        helperText={
          isValidLongUrl(editedLongUrl, true)
            ? ''
            : "This doesn't look like a valid url."
        }
        inputProps={{
          style: { padding: '5px', fontSize: '0.875rem' },
        }}
        // eslint-disable-next-line react/jsx-no-duplicate-props
        InputProps={{
          classes: {
            root: classes.textField,
          },
          startAdornment: (
            <InputAdornment
              variant="standard"
              position="start"
              classes={{ root: classes.httpsInputAdornment }}
            >
              https://
            </InputAdornment>
          ),
        }}
      />
    )
  },
  editedLongUrlAreEqual,
)

EditableTextField.propTypes = {
  editedLongUrl: PropTypes.string.isRequired,
  shortUrl: PropTypes.string.isRequired,
  originalLongUrl: PropTypes.string.isRequired,
  onSaveUrl: PropTypes.func.isRequired,
  setEditedLongUrl: PropTypes.func.isRequired,
  classes: PropTypes.shape({}).isRequired,
}

export default withStyles(userPageStyle)(EditableTextField)
