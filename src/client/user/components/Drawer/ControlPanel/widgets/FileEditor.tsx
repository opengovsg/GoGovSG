import React, { useState } from 'react'
import {
  CircularProgress,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import FileInputField from '../../../../widgets/FileInputField'
import CollapsibleMessage from '../../../../../app/components/CollapsibleMessage'
import {
  CollapsibleMessagePosition,
  CollapsibleMessageType,
} from '../../../../../app/components/CollapsibleMessage/types'
import TrailingButton from './TrailingButton'
import ConfigOption, {
  TrailingPosition,
} from '../../../../widgets/ConfigOption'
import DrawerTooltip from './DrawerTooltip'
import useShortLink from '../util/shortlink'
import { useDrawerState } from '../../index'
import { removeHttpsProtocol } from '../../../../../app/util/url'

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
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const drawerStates = useDrawerState()
  const { shortLinkDispatch, shortLinkState, isUploading } = useShortLink(
    drawerStates.relevantShortLink!,
  )
  const [uploadFileError, setUploadFileError] = useState<string | null>(null)
  const originalLongUrl = removeHttpsProtocol(shortLinkState?.longUrl || '')

  const replaceFileHelp = (
    <div className={classes.originalFileLabel}>
      Original file{' '}
      <DrawerTooltip
        title="Original file will be replaced after you select file. Maximum file size is 10mb."
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
            inputId="replace-file-input"
            text={originalLongUrl}
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
      trailing={
        <label htmlFor="replace-file-input">
          <TrailingButton
            onClick={() => {}}
            disabled={isUploading}
            variant={isMobileView ? 'contained' : 'outlined'}
            fullWidth={isMobileView}
            component="span"
          >
            {isUploading ? (
              <CircularProgress color="primary" size={20} />
            ) : (
              'Replace file'
            )}
          </TrailingButton>
        </label>
      }
      wrapTrailing={isMobileView}
      trailingPosition={TrailingPosition.end}
    />
  )
}
