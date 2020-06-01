import React, { useState } from 'react'
import PropTypes from 'prop-types'
import i18next from 'i18next'
import {
  Button,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
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
import LinkIcon from '../Widgets/LinkIcon'
import FileIcon from '../Widgets/FileIcon'
import InfoIcon from '../Widgets/InfoIcon'
import { formatBytes } from '../../../util/format'
import CollapsibleMessage from '../../CollapsibleMessage'

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

export default function CreateLinkForm({
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
  const [noFileText, setNoFileText] = useState('No file selected')
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
      <Divider />
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
                placeholder="Enter your link"
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
              <div className={classes.fileInputWrapper}>
                <Typography className={classes.labelText} variant="body1">
                  Choose your file
                </Typography>
                <div className={classes.maxSizeTextWrapper}>
                  <InfoIcon />
                  <Typography variant="caption" className={classes.maxSizeText}>
                    Maximum size 10mb
                  </Typography>
                </div>
              </div>
              <div className={classes.fileInput}>
                <Typography
                  variant="body2"
                  className={`${classes.fileNameText} ${
                    file ? '' : classes.fileNameEmpty
                  }`}
                >
                  {file ? file.name : noFileText}
                </Typography>
                <input
                  type="file"
                  id="file"
                  className={classes.fileInputInvis}
                  onChange={(event) => {
                    const chosenFile = event.target.files[0]
                    if (!chosenFile) {
                      return
                    }
                    if (chosenFile.size > 10 * 1024 * 1024) {
                      setNoFileText('File size too large.')
                      setFile(null)
                      setUploadFileError(
                        'File too large, please upload a file smaller than 10mb',
                      )
                      return
                    }
                    setUploadFileError(null)
                    setFile(chosenFile)
                  }}
                />
                <div className={classes.uploadFileInputEndWrapper}>
                  <Typography variant="body2" className={classes.fileSizeText}>
                    {file ? formatBytes(file.size) : ''}
                  </Typography>
                  <label htmlFor="file">
                    <Button
                      variant="contained"
                      className={classes.uploadFileButton}
                      component="span"
                    >
                      Browse
                    </Button>
                  </label>
                </div>
              </div>
              <CollapsibleMessage visible={!!uploadFileError} type="error">
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
                      onClick={setRandomShortUrl}
                      size="small"
                    >
                      <img src={refreshIcon} alt="Get new short link" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
              variant="outlined"
              placeholder="Customise your link"
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
            <CollapsibleMessage visible={!!createShortLinkError} type="error">
              {createShortLinkError}
            </CollapsibleMessage>
          </div>
          {isUploading && <LinearProgress style={{ marginTop: '24px' }} />}
          <Button
            className={classes.button}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            disabled={submitDisabled}
          >
            Create link
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
}
