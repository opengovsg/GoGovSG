import React, { FunctionComponent, useCallback } from 'react'
import { Typography, makeStyles, createStyles } from '@material-ui/core'
import { MAX_FILE_UPLOAD_SIZE } from '../../../../shared/constants'
import { useDropzone } from 'react-dropzone'

type FileInputFieldStyleProps = {
  uploadFileError: string | null
  fileDropZoneHeight: number | string
}

type FileInputFieldProps = {
  uploadFileError: string | null
  fileDropZoneHeight: number | string
  text: string
  endAdornment?: JSX.Element
  inputId: string
  setFile: (file: File | null) => void
  setUploadFileError: (error: string | null) => void
  className?: string
}

const useStyles = makeStyles(() =>
  createStyles({
    fileNameText: {
      fontWeight: 400,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    dropZone: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: (props: FileInputFieldStyleProps) => props.fileDropZoneHeight,
      padding: 20,
      borderRadius: 2,
      border: (props: FileInputFieldStyleProps) =>
        props.uploadFileError ? '2px dashed #C85151' : '2px dashed rgba(0, 0, 0, 0.23)',
      backgroundColor: '#4566821A',
      color: '#384a51',
      outline: 'none',
      transition: 'border .24s ease-in-out',
    },
  }),
)

export const FileInputField: FunctionComponent<FileInputFieldProps> = ({
  fileDropZoneHeight,
  text,
  uploadFileError,
  endAdornment,
  inputId,
  setFile,
  setUploadFileError,
  className,
}) => {
  const classes = useStyles({ fileDropZoneHeight, uploadFileError })
  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles) {
      return
    }

    const chosenFile = acceptedFiles[0];
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
  }, [])
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps({ className: `${classes.dropZone} ${className || ''}` })}>
      <Typography variant="body2" className={classes.fileNameText}>
        {text}
      </Typography>

      <input
        {...getInputProps()}
        id={inputId}
      />

      {endAdornment}
    </div>
  )
}

export default FileInputField
