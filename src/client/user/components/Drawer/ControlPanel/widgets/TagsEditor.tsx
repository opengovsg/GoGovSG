import React, { useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'

import useShortLink from '../util/shortlink'
import { useDrawerState } from '../../index'
import ConfigOption, {
  TrailingPosition,
} from '../../../../widgets/ConfigOption'
import TagsAutocomplete from '../../../../widgets/TagsAutocomplete'
import Tooltip from '../../../../widgets/Tooltip'
import { MAX_NUM_TAGS_PER_LINK } from '../../../../../../shared/constants'

const useStyles = makeStyles((theme) =>
  createStyles({
    tagsAutoCompleteWrapper: {
      marginTop: theme.spacing(1),
    },
  }),
)

export default function TagsEditor() {
  const classes = useStyles()

  const drawerStates = useDrawerState()
  const { shortLinkState, shortLinkDispatch } = useShortLink(
    drawerStates.relevantShortLink!,
  )
  const initialTags = shortLinkState?.tags || []
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState('')

  const setTagsAndApplyEdit = (tags: string[]) => {
    setTags(tags)
    shortLinkDispatch?.applyEditTags(tags)
  }

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
            setTags={setTagsAndApplyEdit}
            tagInput={tagInput}
            setTagInput={setTagInput}
            disabled={tags.length >= MAX_NUM_TAGS_PER_LINK}
          />
        </div>
      }
      trailing={null}
      trailingPosition={TrailingPosition.none}
    />
  )
}
