import React, { useState } from 'react'
import {
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

import useShortLink from '../util/shortlink'
import { removeHttpsProtocol } from '../../../../../app/util/url'
import { useDrawerState } from '../../index'
import { isValidLongUrl } from '../../../../../../shared/util/validation'
import ConfigOption, {
  TrailingPosition,
} from '../../../../widgets/ConfigOption'
import PrefixableTextField from '../../../../widgets/PrefixableTextField'
import TrailingButton from './TrailingButton'

export default function LongUrlEditor() {
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const drawerStates = useDrawerState()
  const { shortLinkState, shortLinkDispatch } = useShortLink(
    drawerStates.relevantShortLink!,
  )
  const originalLongUrl = removeHttpsProtocol(shortLinkState?.longUrl || '')
  const [editedLongUrl, setEditedLongUrl] = useState<string>(originalLongUrl)

  return (
    <ConfigOption
      title="Original link"
      leading={
        <PrefixableTextField
          value={editedLongUrl}
          onChange={(event) => setEditedLongUrl(event.target.value)}
          placeholder="Original link"
          prefix="https://"
          error={!isValidLongUrl(editedLongUrl, true)}
          helperText={
            isValidLongUrl(editedLongUrl, true)
              ? ' '
              : "This doesn't look like a valid url."
          }
        />
      }
      trailing={
        <TrailingButton
          disabled={
            !isValidLongUrl(editedLongUrl, false) ||
            editedLongUrl === originalLongUrl
          }
          onClick={() => shortLinkDispatch?.applyEditLongUrl(editedLongUrl)}
          fullWidth={isMobileView}
          variant={isMobileView ? 'contained' : 'outlined'}
        >
          Save
        </TrailingButton>
      }
      wrapTrailing={isMobileView}
      trailingPosition={TrailingPosition.end}
    />
  )
}
