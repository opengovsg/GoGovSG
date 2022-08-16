import React, { FunctionComponent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { History } from 'history'
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
  useTheme,
} from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import useCreateLinkFormStyles from './styles/createLinkForm'
import {
  isValidLongUrl,
  isValidShortUrl,
  isValidTag,
} from '../../../../shared/util/validation'
import { MAX_NUM_TAGS_PER_LINK } from '../../../../shared/constants'
import ModalMargins from './ModalMargins'
import refreshIcon from './assets/refresh-icon.svg'
import LinkIcon from '../../widgets/LinkIcon'
import FileIcon from '../../widgets/FileIcon'
import { formatBytes } from '../../../app/util/format'
import CollapsibleMessage from '../../../app/components/CollapsibleMessage'
import { CollapsibleMessageType } from '../../../app/components/CollapsibleMessage/types'
import { FileInputField } from '../../widgets/FileInputField'
import userActions from '../../actions'
import { GAEvent } from '../../../app/util/ga'
import { GoGovReduxState } from '../../../app/reducers/types'
import FormStartAdorment, { TEXT_FIELD_HEIGHT } from './FormStartAdorment'
import FormTag from './FormTag'
import Tooltip from '../../widgets/Tooltip'

type CreateLinkFormProps = {
  onSubmitLink: (history: History) => {}
  onSubmitFile: (file: File | null) => {}
}

const CreateLinkForm: FunctionComponent<CreateLinkFormProps> = ({
  onSubmitLink,
  onSubmitFile,
}: CreateLinkFormProps) => {
  const shortUrl = useSelector((state: GoGovReduxState) => state.user.shortUrl)
  const longUrl = useSelector((state: GoGovReduxState) => state.user.longUrl)
  const isUploading = useSelector(
    (state: GoGovReduxState) => state.user.isUploading,
  )
  const createShortLinkError = useSelector(
    (state: GoGovReduxState) => state.user.createShortLinkError,
  )
  const uploadFileError = useSelector(
    (state: GoGovReduxState) => state.user.uploadFileError,
  )

  const theme = useTheme()
  const dispatch = useDispatch()
  const setShortUrl = (shortUrl: string) =>
    dispatch(userActions.setShortUrl(shortUrl))
  const setLongUrl = (longUrl: string) =>
    dispatch(userActions.setLongUrl(longUrl))
  const setRandomShortUrl = () => dispatch(userActions.setRandomShortUrl())
  const setUploadFileError = (error: string) =>
    dispatch(userActions.setUploadFileError(error))
  const setCreateShortLinkError = (error: string) =>
    dispatch(userActions.setCreateShortLinkError(error))

  const history = useHistory()

  const [isFile, setIsFile] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

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

  useEffect(() => {
    if (isFile) {
      // Google Analytics: click on 'from file' tab
      GAEvent('modal page', 'click file tab')
    } else {
      // Google Analytics: click on 'from url' tab
      GAEvent('modal page', 'click url tab')
    }
  }, [isFile])

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
              onSubmitLink(history)
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
              <LinkIcon
                color={
                  isFile
                    ? theme.palette.primary.dark
                    : theme.palette.background.default
                }
              />
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
              <FileIcon
                color={
                  isFile
                    ? theme.palette.background.default
                    : theme.palette.primary.dark
                }
              />
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
                Original link (this will be <strong>publicly</strong> indexable
                by search engines)
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
                  Choose your file (this will be <strong>publicly</strong>{' '}
                  indexable by search engines)
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
                    {/* eslint-disable-next-line */}
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
                        setCreateShortLinkError('')
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
                setCreateShortLinkError('')
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
              <a className={classes.shortLinkError} href="/#/directory">
                {createShortLinkError}
              </a>
            </CollapsibleMessage>
          </div>
          <div className={classes.labelText}>
            <Typography variant="body1">
              Tag (add up to <strong>{MAX_NUM_TAGS_PER_LINK} tags</strong>){' '}
              <Tooltip
                title="Tags are words, or combinations of words, you can use to classify or describe your link."
                imageAltText="Tags help"
              />
            </Typography>
          </div>
          <div>
            <Autocomplete
              multiple
              options={['']}
              value={tags}
              PaperComponent={React.forwardRef(() => null)}
              popupIcon={null}
              closeIcon={null}
              disabled={isUploading || tags.length >= MAX_NUM_TAGS_PER_LINK}
              renderTags={(tags) =>
                tags.map((tag) => (
                  <FormTag
                    key={tag}
                    tag={tag}
                    onClose={() => setTags(tags.filter((t) => t !== tag))}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  disabled={params.disabled}
                  error={!isValidTag(tagInput, true) || tags.includes(tagInput)}
                  className={classes.tagsText}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return
                    event.preventDefault() // prevent form from submitting
                    if (isValidTag(tagInput) && !tags.includes(tagInput)) {
                      setTagInput('')
                      setTags([...tags, tagInput])
                    }
                  }}
                  inputProps={params.inputProps}
                  InputProps={{
                    startAdornment: params.InputProps.startAdornment,
                    className: classes.outlinedTagsTextInput,
                    classes: {
                      input: classes.tagsTextInput,
                      notchedOutline: classes.inputNotchedOutline,
                    },
                  }}
                  variant="outlined"
                  placeholder={
                    tags.length < MAX_NUM_TAGS_PER_LINK ? 'Add tag' : ''
                  }
                  onChange={(event) => {
                    setTagInput(event.target.value)
                  }}
                  value={tagInput}
                  helperText={(() => {
                    if (!isValidTag(tagInput, true)) {
                      return 'Tags should only consist of letters, numbers and hyphens and be no more than 25 characters long.'
                    }
                    if (tags.includes(tagInput)) {
                      return 'This tag already exists.'
                    }
                    return ''
                  })()}
                />
              )}
            />
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

export default CreateLinkForm
