import React, { useState } from 'react'
import {
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import _ from 'lodash'

import useShortLink from '../util/shortlink.js'
import { useDrawerState } from '../../index.js'
import ConfigOption, {
  TrailingPosition,
} from '../../../../widgets/ConfigOption.js'
import TagsAutocomplete from '../../../../widgets/TagsAutocomplete.js'
import Tooltip from '../../../../widgets/Tooltip.js'
import { MAX_NUM_TAGS_PER_LINK } from '../../../../../../shared/constants.js'
import TrailingButton from './TrailingButton.js'
import {
  isValidTag,
  isValidTags,
} from '../../../../../../shared/util/validation.js'

const useStyles = makeStyles((theme) =>
  createStyles({
    tagsAutoCompleteWrapper: {
      marginTop: theme.spacing(1),
    },
  }),
)

export default function TagsEditor() {
  const theme = useTheme()
  const classes = useStyles()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))

  const drawerStates = useDrawerState()
  const { shortLinkState, shortLinkDispatch } = useShortLink(
    drawerStates.relevantShortLink!,
  )
  const initialTags = shortLinkState?.tags || []
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState('')

  return (
    <ConfigOption
      title={
        <>
          Tag (add up to <strong>{MAX_NUM_TAGS_PER_LINK} tags</strong>){' '}
          <Tooltip
            title="Tags are words, or combinations of words, you can use to classify or describe your link."
            imageAltText="Tags help"
          />
        </>
      }
      leading={
        <div className={classes.tagsAutoCompleteWrapper}>
          <TagsAutocomplete
            tags={tags}
            setTags={setTags}
            tagInput={tagInput}
            setTagInput={setTagInput}
            disabled={tags.length >= MAX_NUM_TAGS_PER_LINK}
            fixHelperTextPosition
          />
        </div>
      }
      trailing={
        <TrailingButton
          disabled={
            !isValidTags(tags) ||
            _.isEqual([...tags].sort(), [...initialTags].sort()) ||
            !isValidTag(tagInput, true)
          }
          onClick={() => {
            // Ensure tags are updated with any remaining tag input before saving
            const tagsForSaving =
              tagInput && isValidTag(tagInput) && !tags.includes(tagInput)
                ? [...tags, tagInput]
                : tags
            shortLinkDispatch?.applyEditTags(tagsForSaving)
          }}
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
