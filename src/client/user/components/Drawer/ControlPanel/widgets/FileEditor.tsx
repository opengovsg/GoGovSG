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
import { humanFileSize } from '../../../../../../shared/util/bytes-formatter'

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

export default function FileEditor() {
  const classes = useStyles()
  const drawerStates = useDrawerState()
  const { shortLinkDispatch, shortLinkState, isUploading } = useShortLink(
    drawerStates.relevantShortLink!,
  )
  const [uploadFileError, setUploadFileError] = useState<string | null>(null)
  const originalLongUrl = removeHttpsProtocol(shortLinkState?.longUrl || '')

  const replaceFileHelp = (
    <div className={classes.originalFileLabel}>
      Original file{' '}
      <Tooltip
        title={`Original file will be replaced after you select file. Maximum file size is ${humanFileSize(
          MAX_FILE_UPLOAD_SIZE,
        )}.`}
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
            fileNameText={originalLongUrl}
            buttonText="Replace file"
            isUploading={isUploading}
            setFile={(newFile) => {
              shortLinkDispatch?.replaceFile(newFile, setUploadFileError)
            }}
            setUploadFileError={setUploadFileError}
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
      trailingPosition={TrailingPosition.none}
    />
  )
}
