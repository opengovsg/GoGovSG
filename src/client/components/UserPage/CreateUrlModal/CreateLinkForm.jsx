import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import i18next from 'i18next'
import {
  Button,
  CircularProgress,
  Divider,
  Hidden,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@material-ui/core'

import useCreateLinkFormStyles from './styles/createLinkForm'
import {
  isValidLongUrl,
  isValidShortUrl,
} from '../../../../shared/util/validation'
import ModalMargins from './ModalMargins'
import refreshIcon from './assets/refresh-icon.svg'
import LinkIcon from '../widgets/LinkIcon'
import FileIcon from '../widgets/FileIcon'
import { formatBytes } from '../../../util/format'
import CollapsibleMessage from '../../CollapsibleMessage'
import { CollapsibleMessageType } from '../../CollapsibleMessage/types'
import FileInputField from '../widgets/FileInputField'
import userActions from '~/actions/user'

// Height of the text field in the create link dialog.
const TEXT_FIELD_HEIGHT = 44

const FormStartAdorment = ({ children }) => {
  const classes = useCreateLinkFormStyles({
    textFieldHeight: TEXT_FIELD_HEIGHT,
  })
  return (
    <InputAdornment className={classes.startAdorment} position="start">
      <Typography className={classes.startAdormentText} color="textSecondary">
        {children}
      </Typography>
    </InputAdornment>
  )
}

const mapStateToProps = (state) => ({
  shortUrl: state.user.shortUrl,
  longUrl: state.user.longUrl,
  isUploading: state.user.isUploading,
  createShortLinkError: state.user.createShortLinkError,
  uploadFileError: state.user.uploadFileError,
})

const mapDispatchToProps = (dispatch) => ({
  setShortUrl: (shortUrl) => dispatch(userActions.setShortUrl(shortUrl)),
  setLongUrl: (longUrl) => dispatch(userActions.setLongUrl(longUrl)),
  setRandomShortUrl: () => dispatch(userActions.setRandomShortUrl()),
  setUploadFileError: (error) =>
    dispatch(userActions.setUploadFileError(error)),
  setCreateShortLinkError: (error) =>
    dispatch(userActions.setCreateShortLinkError(error)),
})

function CreateLinkForm({
  onSubmitLink,
  shortUrl,
  setShortUrl,
  longUrl,
  setLongUrl,
  setRandomShortUrl,
  isUploading,
  onSubmitFile,
  uploadFileError,
  setUploadFileError,
  createShortLinkError,
  setCreateShortLinkError,
}) {
  const [isFile, setIsFile] = useState(false)
  const [file, setFile] = useState(null)
  const classes = useCreateLinkFormStyles({
    textFieldHeight: TEXT_FIELD_HEIGHT,
    isFile,
    uploadFileError,
    createShortLinkError,
  })
  const submitDisabled =
    !isValidShortUrl(shortUrl, false) ||
    (!isFile && !isValidLongUrl(longUrl, false)) ||
    (isFile && !file) ||
    (isFile && !!uploadFileError) ||
    isUploading ||
    !!createShortLinkError
  return (
    <>
      <Hidden smUp>
        <Divider />
      </Hidden>
      <ModalMargins>
        <form
          className={classes.form}
          onSubmit={(e) => {
            e.preventDefault()
            if (isFile) {
              onSubmitFile(file)
            } else {
              onSubmitLink()
            }
          }}
        >
          <div color="primary" className={classes.linkTypeWrapper}>
            <Button
              variant={isFile ? 'text' : 'contained'}
              className={`${classes.linkTypeButton} ${
                isFile ? '' : classes.linkTypeButtonEnabled
              }`}
              onClick={() => setIsFile(false)}
            >
              <LinkIcon color={isFile ? '#384a51' : '#f9f9f9'} />
              <Typography
                variant="body2"
                className={classes.linkTypeUrlButtonText}
              >
                From URL
              </Typography>
            </Button>
            <Button
              variant={isFile ? 'contained' : 'text'}
              className={`${classes.linkTypeButton} ${
                isFile ? classes.linkTypeButtonEnabled : ''
              }`}
              onClick={() => setIsFile(true)}
            >
              <FileIcon color={isFile ? '#f9f9f9' : '#384a51'} />
              <Typography
                variant="body2"
                className={classes.linkTypeFileButtonText}
              >
                From file
              </Typography>
            </Button>
          </div>
          {!isFile && (
            <>
              <Typography className={classes.labelText} variant="body1">
                Original link
              </Typography>
              <TextField
                error={!isValidLongUrl(longUrl, true)}
                InputProps={{
                  className: classes.outlinedInput,
                  classes: {
                    input: classes.input,
                  },
                  startAdornment: (
                    <FormStartAdorment>https://</FormStartAdorment>
                  ),
                }}
                required
                variant="outlined"
                placeholder="Enter URL"
                onChange={(event) => setLongUrl(event.target.value)}
                value={longUrl}
                helperText={
                  isValidLongUrl(longUrl, true)
                    ? ''
                    : "This doesn't look like a valid URL."
                }
              />
            </>
          )}
          {isFile && (
            <>
              <div className={classes.fileInputDescWrapper}>
                <Typography className={classes.labelText} variant="body1">
                  Choose your file
                </Typography>
                <div className={classes.maxSizeTextWrapper}>
                  <Typography variant="caption" className={classes.maxSizeText}>
                    Maximum size 10mb
                  </Typography>
                </div>
              </div>
              <FileInputField
                textFieldHeight={TEXT_FIELD_HEIGHT}
                text={file ? file.name : 'No file selected'}
                uploadFileError={uploadFileError}
                inputId="file"
                setFile={setFile}
                setUploadFileError={setUploadFileError}
                endAdornment={
                  <div className={classes.uploadFileInputEndWrapper}>
                    <Typography
                      variant="body2"
                      className={classes.fileSizeText}
                    >
                      {file ? formatBytes(file.size) : ''}
                    </Typography>
                    <label htmlFor="file">
                      <Button
                        variant="contained"
                        className={classes.uploadFileButton}
                        component="span"
                        color="primary"
                        disabled={isUploading}
                      >
                        Browse
                      </Button>
                    </label>
                  </div>
                }
              />
              <CollapsibleMessage
                visible={!!uploadFileError}
                type={CollapsibleMessageType.Error}
              >
                {uploadFileError}
              </CollapsibleMessage>
            </>
          )}
          <div className={classes.labelText}>
            <Typography variant="body1">
              Short link (<strong>cannot be deleted</strong> after creation)
            </Typography>
          </div>
          <div>
            <TextField
              disabled={isUploading}
              error={!isValidShortUrl(shortUrl, true)}
              className={classes.shortUrlInput}
              InputProps={{
                className: classes.outlinedInput,
                classes: {
                  input: classes.input,
                  notchedOutline: classes.inputNotchedOutline,
                },
                startAdornment: (
                  <FormStartAdorment>
                    {i18next.t('general.shortUrlPrefix')}
                  </FormStartAdorment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      className={classes.refreshIcon}
                      onClick={() => {
                        setRandomShortUrl()
                        setCreateShortLinkError(null)
                      }}
                      size="small"
                      disabled={isUploading}
                    >
                      <img
                        src={refreshIcon}
                        className={classes.iconTest}
                        alt="Get new short link"
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
              variant="outlined"
              placeholder="your customised link"
              onChange={(event) => {
                setShortUrl(event.target.value)
                setCreateShortLinkError(null)
              }}
              value={shortUrl}
              helperText={
                isValidShortUrl(shortUrl, true)
                  ? ''
                  : 'Short links should only consist of lowercase letters, numbers and hyphens.'
              }
            />
            <CollapsibleMessage
              visible={!!createShortLinkError}
              type={CollapsibleMessageType.Error}
            >
              {createShortLinkError}
            </CollapsibleMessage>
          </div>
          <Button
            className={classes.button}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            disabled={submitDisabled}
          >
            {isUploading ? (
              <CircularProgress color="primary" size={20} />
            ) : (
              'Create link'
            )}
          </Button>
        </form>
      </ModalMargins>
    </>
  )
}

CreateLinkForm.propTypes = {
  onSubmitLink: PropTypes.func.isRequired,
  onSubmitFile: PropTypes.func.isRequired,
  shortUrl: PropTypes.string.isRequired,
  setShortUrl: PropTypes.func.isRequired,
  longUrl: PropTypes.string.isRequired,
  setLongUrl: PropTypes.func.isRequired,
  setRandomShortUrl: PropTypes.func.isRequired,
  isUploading: PropTypes.bool.isRequired,
  uploadFileError: PropTypes.string.isRequired,
  setUploadFileError: PropTypes.func.isRequired,
  createShortLinkError: PropTypes.string.isRequired,
  setCreateShortLinkError: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateLinkForm)
