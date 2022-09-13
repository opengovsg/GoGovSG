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
} from '@material-ui/core'
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
import CsvIcon from '../../widgets/CsvIcon'
import StarIcon from '../../widgets/StarIcon'
import { formatBytes } from '../../../app/util/format'
import CollapsibleMessage from '../../../app/components/CollapsibleMessage'
import CreateTypeButton from './components/CreateTypeButton'
import { CollapsibleMessageType } from '../../../app/components/CollapsibleMessage/types'
import { downloadSampleBulkCsv } from '../../../app/util/download'
import { FileInputField } from '../../widgets/FileInputField'
import userActions from '../../actions'
import { GAEvent } from '../../../app/util/ga'
import { GoGovReduxState } from '../../../app/reducers/types'
import { TEXT_FIELD_HEIGHT } from '../../constants'
import FormStartAdorment from './FormStartAdorment'
import Tooltip from '../../widgets/Tooltip'
import TagsAutocomplete from '../../widgets/TagsAutocomplete'

type CreateLinkFormProps = {
  onSubmitLink: (history: History) => {}
  onSubmitFile: (file: File | null) => {}
  onSubmitBulk: (file: File | null) => void // TODO: update with API integration
}

enum CreateType {
  LINK = 'link',
  FILE = 'file',
  BULK = 'bulk',
}

const CreateLinkForm: FunctionComponent<CreateLinkFormProps> = ({
  onSubmitLink,
  onSubmitFile,
  onSubmitBulk,
}: CreateLinkFormProps) => {
  const shortUrl = useSelector((state: GoGovReduxState) => state.user.shortUrl)
  const longUrl = useSelector((state: GoGovReduxState) => state.user.longUrl)
  const tags = useSelector((state: GoGovReduxState) => state.user.tags)
  const isUploading = useSelector(
    (state: GoGovReduxState) => state.user.isUploading,
  )
  const createShortLinkError = useSelector(
    (state: GoGovReduxState) => state.user.createShortLinkError,
  )
  const uploadFileError = useSelector(
    (state: GoGovReduxState) => state.user.uploadFileError,
  )

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
  const setTags = (tags: string[]) => dispatch(userActions.setTags(tags))

  const history = useHistory()

  const [createType, setCreateType] = useState<CreateType>(CreateType.LINK)
  const [file, setFile] = useState<File | null>(null)
  const [tagInput, setTagInput] = useState('')

  const classes = useCreateLinkFormStyles({
    textFieldHeight: TEXT_FIELD_HEIGHT,
    uploadFileError,
    createShortLinkError,
  })

  const submitDisabled = () => {
    const isInvalidTags =
      tags.some((tag) => !isValidTag(tag)) ||
      !isValidTag(tagInput, true) ||
      tags.includes(tagInput)
    switch (createType) {
      case CreateType.LINK:
        return (
          !isValidShortUrl(shortUrl, false) ||
          !isValidLongUrl(longUrl, false) ||
          !!createShortLinkError ||
          isInvalidTags
        )
      case CreateType.FILE:
        return (
          !isValidShortUrl(shortUrl, false) ||
          !file ||
          !!uploadFileError ||
          isUploading ||
          !!createShortLinkError ||
          isInvalidTags
        )
      case CreateType.BULK:
        return !file || !!uploadFileError || isUploading || isInvalidTags
      default:
        console.log('error, unrecognised createType')
        return true
    }
  }

  useEffect(() => {
    setFile(null) // reset file state if toggling between createType
    switch (createType) {
      case CreateType.LINK:
        GAEvent('modal page', 'click url tab')
        break
      case CreateType.FILE:
        GAEvent('modal page', 'click file tab')
        break
      case CreateType.BULK:
        GAEvent('modal page', 'click bulk tab')
        break
      default:
        console.log('error, unrecognised createType')
    }
  }, [createType])

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
            switch (createType) {
              case CreateType.LINK:
                onSubmitLink(history)
                break
              case CreateType.FILE:
                onSubmitFile(file)
                break
              case CreateType.BULK:
                onSubmitBulk(file)
                break
              default:
                console.log('error, unrecognised createType')
            }
          }}
        >
          <div color="primary" className={classes.linkTypeWrapper}>
            <CreateTypeButton
              InputProps={{ classes }}
              Icon={LinkIcon}
              isEnabled={createType !== CreateType.LINK}
              onChange={() => setCreateType(CreateType.LINK)}
            >
              To a URL
            </CreateTypeButton>
            <CreateTypeButton
              InputProps={{ classes }}
              Icon={FileIcon}
              isEnabled={createType !== CreateType.FILE}
              onChange={() => setCreateType(CreateType.FILE)}
            >
              To a File
            </CreateTypeButton>
            <CreateTypeButton
              InputProps={{ classes }}
              Icon={CsvIcon}
              isEnabled={createType !== CreateType.BULK}
              onChange={() => setCreateType(CreateType.BULK)}
            >
              From a .csv
            </CreateTypeButton>
          </div>
          {createType === CreateType.LINK && (
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
          {createType === CreateType.FILE && (
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
                setFile={setFile}
                setUploadFileError={setUploadFileError}
                buttonText="Browse"
                fileSizeText={file ? formatBytes(file.size) : ''}
                isUploading={isUploading}
              />
              <CollapsibleMessage
                visible={!!uploadFileError}
                type={CollapsibleMessageType.Error}
              >
                {uploadFileError}
              </CollapsibleMessage>
            </>
          )}
          {createType !== CreateType.BULK && (
            <>
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
            </>
          )}
          {createType === CreateType.BULK && (
            <>
              <div className={classes.bulkUploadDescWrapper}>
                <StarIcon />
                <Typography
                  className={`${classes.bulkUploadDescText}`}
                  variant="body1"
                >
                  New feature to shorten your original links in bulk! Here is
                  how:
                  <br />
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  1.{' '}
                  <Button
                    onClick={downloadSampleBulkCsv}
                    className={classes.bulkSampleDownloadText}
                  >
                    Download template .csv file
                  </Button>
                  <br />
                  2. Fill up the template file with your links (up to 1000
                  links)
                  <br />
                  3. Upload the .csv file here <br />
                </Typography>
              </div>
              <div className={classes.fileInputDescWrapper}>
                <Typography className={classes.labelText} variant="body1">
                  Choose your <b>.csv</b> file (the links in this file will be{' '}
                  <b>publicly indexable</b> by search engines)
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
                acceptedTypes=".csv"
              />
              <div className={classes.maxSizeTextWrapper}>
                <Typography variant="caption" className={classes.maxSizeText}>
                  Only CSV format files are allowed. <br />
                  If you have an Excel file, please convert it by going to File
                  &gt; Save As &gt; CSV (Comma delimited).
                </Typography>
              </div>
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
              Tag (add up to <strong>{MAX_NUM_TAGS_PER_LINK} tags</strong>){' '}
              <Tooltip
                title="Tags are words, or combinations of words, you can use to classify or describe your link."
                imageAltText="Tags help"
              />
            </Typography>
          </div>
          <div>
            <TagsAutocomplete
              tags={tags}
              setTags={setTags}
              tagInput={tagInput}
              setTagInput={setTagInput}
              disabled={isUploading || tags.length >= MAX_NUM_TAGS_PER_LINK}
            />
          </div>
          <Button
            className={classes.button}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            disabled={submitDisabled()}
          >
            {isUploading ? (
              <CircularProgress color="primary" size={20} />
            ) : (
              'Create'
            )}
          </Button>
        </form>
      </ModalMargins>
    </>
  )
}

export default CreateLinkForm
