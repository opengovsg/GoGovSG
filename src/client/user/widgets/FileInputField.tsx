import React, { FunctionComponent } from 'react'
import { Hidden, Typography, makeStyles, createStyles } from '@material-ui/core'
import FileIconLarge from './FileIconLarge'
import { MAX_FILE_UPLOAD_SIZE } from '../../../shared/constants'

type FileInputFieldStyleProps = {
  uploadFileError: string | null
  textFieldHeight: number | string
}

type FileInputFieldProps = {
  uploadFileError: string | null
  textFieldHeight: number | string
  text: string
  endAdornment?: JSX.Element
  inputId: string
  setFile: (file: File | null) => void
  setUploadFileError: (error: string | null) => void
  className?: string
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
      backgroundColor: '#456682',
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
      backgroundColor: '#d8d8d8',
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden',
      justifyContent: 'space-between',
      borderRadius: '3px',
      [theme.breakpoints.up('sm')]: {
        backgroundColor: '#e8e8e8',
      },
    },
  }),
)

export const FileInputField: FunctionComponent<FileInputFieldProps> = ({
  textFieldHeight,
  text,
  uploadFileError,
  endAdornment,
  inputId,
  setFile,
  setUploadFileError,
  className,
}) => {
  const classes = useStyles({ textFieldHeight, uploadFileError })
  return (
    <div className={`${classes.fileInputWrapper} ${className}`}>
      <Hidden smDown>
        <div className={classes.leftFileIcon}>
          <FileIconLarge color="#f9f9f9" />
        </div>
      </Hidden>
      <div className={classes.fileInput}>
        <Typography variant="body2" className={classes.fileNameText}>
          {text}
        </Typography>
        <input
          type="file"
          id={inputId}
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
            setUploadFileError(null)
            setFile(chosenFile)
          }}
        />
        {endAdornment}
      </div>
    </div>
  )
}

export default FileInputField
