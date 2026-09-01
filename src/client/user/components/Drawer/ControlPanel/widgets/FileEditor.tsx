import React, { useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { FileInputField } from '../../../../widgets/FileInputField'
import CollapsibleMessage from '../../../../../app/components/CollapsibleMessage'
import {
  CollapsibleMessagePosition,
  CollapsibleMessageType,
} from '../../../../../app/components/CollapsibleMessage/types'
import ConfigOption, {
  TrailingPosition,
} from '../../../../widgets/ConfigOption'
import Tooltip from '../../../../widgets/Tooltip'
import useShortLink from '../util/shortlink'
import { useDrawerState } from '../../index'
import { removeHttpsProtocol } from '../../../../../app/util/url'
import { MAX_FILE_UPLOAD_SIZE } from '../../../../../../shared/constants'
import { formatBytes } from '../../../../../app/util/format'

const useStyles = makeStyles((theme) =>
  createStyles({
    fileInputField: {
      marginBottom: theme.spacing(3),
      [theme.breakpoints.up('md')]: {
        marginBottom: 0,
      },
    },
    regularText: {
      fontWeight: 400,
    },
    originalFileLabel: {
      marginBottom: theme.spacing(1),
    },
  }),
)

import TrailingButton from './TrailingButton'

type FileEditorProps = {
  isTypeConversion?: boolean
  requestSaveWithConfirmation?: (saveAction: () => void) => void
}

export default function FileEditor({
  isTypeConversion = false,
  requestSaveWithConfirmation,
}: FileEditorProps) {
  const classes = useStyles()
  const drawerStates = useDrawerState()
  const { shortLinkDispatch, shortLinkState, isUploading } = useShortLink(
    drawerStates.relevantShortLink!,
  )
  const [uploadFileError, setUploadFileError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const originalLongUrl = removeHttpsProtocol(shortLinkState?.longUrl || '')

  const handleFileSelect = (newFile: File | null) => {
    if (!newFile) {
      return
    }
    if (isTypeConversion) {
      setSelectedFile(newFile)
      setUploadFileError(null)
      return
    }
    shortLinkDispatch?.replaceFile(newFile, setUploadFileError)
  }

  const handleSave = () => {
    if (!selectedFile) {
      return
    }
    const saveAction = () =>
      shortLinkDispatch?.replaceFile(selectedFile, setUploadFileError)
    if (requestSaveWithConfirmation) {
      requestSaveWithConfirmation(saveAction)
    } else {
      saveAction()
    }
  }

  const fileNameText = isTypeConversion
    ? selectedFile?.name || ''
    : originalLongUrl
  const buttonText = isTypeConversion ? 'Select file' : 'Replace file'

  const replaceFileHelp = (
    <div className={classes.originalFileLabel}>
      {isTypeConversion ? 'Upload file' : 'Original file'}{' '}
      <Tooltip
        title={
          isTypeConversion
            ? `Select a file to serve through this short link. Maximum file size is ${formatBytes(
                MAX_FILE_UPLOAD_SIZE,
              )}.`
            : `Original file will be replaced after you select file. Maximum file size is ${formatBytes(
                MAX_FILE_UPLOAD_SIZE,
              )}.`
        }
        imageAltText="Replace file help"
      />
    </div>
  )

  return (
    <ConfigOption
      title={replaceFileHelp}
      leading={
        <>
          <FileInputField
            className={classes.fileInputField}
            uploadFileError={uploadFileError}
            textFieldHeight="44px"
            fileNameText={fileNameText}
            buttonText={buttonText}
            isUploading={isUploading}
            setFile={handleFileSelect}
            setUploadFileError={setUploadFileError}
            maxSize={MAX_FILE_UPLOAD_SIZE}
          />
          <CollapsibleMessage
            type={CollapsibleMessageType.Error}
            visible={!!uploadFileError}
            position={CollapsibleMessagePosition.Absolute}
          >
            {uploadFileError}
          </CollapsibleMessage>
        </>
      }
      trailing={
        isTypeConversion ? (
          <TrailingButton
            disabled={!selectedFile || isUploading}
            onClick={handleSave}
            fullWidth={false}
            variant="outlined"
          >
            Save
          </TrailingButton>
        ) : undefined
      }
      trailingPosition={
        isTypeConversion ? TrailingPosition.end : TrailingPosition.none
      }
    />
  )
}
