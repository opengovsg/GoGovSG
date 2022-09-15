import React, { FunctionComponent } from 'react'
import {
  Button,
  CircularProgress,
  Hidden,
  Typography,
  createStyles,
  makeStyles,
  useTheme,
} from '@material-ui/core'
import FileIconLarge from './FileIconLarge'
import { MAX_FILE_UPLOAD_SIZE } from '../../../shared/constants'

type FileInputFieldStyleProps = {
  uploadFileError: string | null
  textFieldHeight: number | string
}

type FileInputFieldProps = {
  uploadFileError: string | null
  textFieldHeight: number | string
  fileNameText: string
  fileSizeText?: string
  buttonText?: string
  setFile: (file: File | null) => void
  setUploadFileError: (error: string) => void
  isUploading: boolean
  className?: string
  acceptedTypes?: string
}

const useStyles = makeStyles((theme) =>
  createStyles({
    fileInputWrapper: {
      width: '100%',
      display: 'flex',
      alignItems: 'stretch',
      borderRadius: '3px',
      overflow: 'hidden',
      border: (props: FileInputFieldStyleProps) =>
        props.uploadFileError ? '2px solid #C85151' : '',
    },
    fileNameText: {
      fontWeight: 400,
      paddingLeft: '16px',
      display: 'flex',
      alignItems: 'center',
    },
    fileInputInvis: {
      display: 'none',
    },
    leftFileIcon: {
      width: '44px',
      backgroundColor: theme.palette.primary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileInput: {
      flexGrow: 1,
      height: '100%',
      minHeight: (props: FileInputFieldStyleProps) => props.textFieldHeight,
      padding: theme.spacing(0),
      lineHeight: 1.5,
      backgroundColor: theme.palette.divider,
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden',
      justifyContent: 'space-between',
      borderRadius: '3px',
      [theme.breakpoints.up('sm')]: {
        backgroundColor: '#e8e8e8',
      },
    },
    fileSizeText: {
      fontWeight: 400,
      display: 'flex',
      alignItems: 'center',
      paddingRight: theme.spacing(1.5),
    },
    fileInputEndWrapper: {
      display: 'flex',
      alignItems: 'stretch',
    },
    uploadButtonText: {
      padding: 0,
      margin: 0,
      width: '120px',
      height: '100%',
      borderRadius: 0,
      color: theme.palette.background.default,
    },
  }),
)

export const FileInputField: FunctionComponent<FileInputFieldProps> = ({
  textFieldHeight,
  fileNameText = '',
  fileSizeText = '',
  buttonText = '',
  setFile,
  uploadFileError,
  setUploadFileError,
  isUploading = false,
  className,
  acceptedTypes = '',
}: FileInputFieldProps) => {
  const theme = useTheme()
  const classes = useStyles({ textFieldHeight, uploadFileError })
  return (
    <div className={`${classes.fileInputWrapper} ${className}`}>
      <Hidden smDown>
        <div className={classes.leftFileIcon}>
          <FileIconLarge color={theme.palette.background.default} />
        </div>
      </Hidden>
      <div className={classes.fileInput}>
        <Typography variant="body2" className={classes.fileNameText}>
          {fileNameText}
        </Typography>
        <input
          type="file"
          id="file"
          className={classes.fileInputInvis}
          onChange={(event) => {
            if (!event.target.files) {
              return
            }
            const chosenFile = event.target.files[0]
            if (!chosenFile) {
              return
            }
            if (chosenFile.size > MAX_FILE_UPLOAD_SIZE) {
              setFile(null)
              setUploadFileError(
                'File too large, please upload a file smaller than 10mb',
              )
              return
            }
            setUploadFileError('')
            setFile(chosenFile)
          }}
          accept={acceptedTypes}
        />
        <Typography variant="body2" className={classes.fileSizeText}>
          {fileSizeText}
        </Typography>
      </div>
      <div className={classes.fileInputEndWrapper}>
        {/* eslint-disable-next-line */}
        <label htmlFor="file">
          <Button
            variant="contained"
            className={classes.uploadButtonText}
            component="span"
            color="primary"
            disabled={isUploading}
          >
            {isUploading ? (
              <CircularProgress color="primary" size={20} />
            ) : (
              buttonText
            )}
          </Button>
        </label>
      </div>
    </div>
  )
}

export default FileInputField
