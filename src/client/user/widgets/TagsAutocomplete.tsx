import React, { useEffect, useState } from 'react'
import {
  Button,
  ClickAwayListener,
  Paper,
  Popper,
  TextField,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { useDispatch, useSelector } from 'react-redux'
import {
  MAX_NUM_TAGS_PER_LINK,
  MIN_TAG_SEARCH_LENGTH,
} from '../../../shared/constants'
import userActions from '../actions'
import { MAX_TAG_LENGTH, isValidTag } from '../../../shared/util/validation'
import { SEARCH_TIMEOUT, TEXT_FIELD_HEIGHT } from '../constants'
import { get } from '../../app/util/requests'
import FormTag from './FormTag'
import { GoGovReduxState } from '../../app/reducers/types'

const useStyles = makeStyles((theme) =>
  createStyles({
    menuPopper: {
      zIndex: 1301, // To place popper above create link modal with default z-index of 1300
    },
    menuPaper: {
      display: 'flex',
      flexDirection: 'column',
    },
    menuButton: {
      fontWeight: 500,
      paddingLeft: 30,
      paddingRight: 30,
      borderRadius: 0,
      justifyContent: 'flex-start',
    },
    outlinedTagsTextInput: {
      padding: theme.spacing(0),
      flexWrap: 'wrap',
    },
    tagsTextInput: {
      flexGrow: 1,
      height: '100%',
      minHeight: TEXT_FIELD_HEIGHT,
      width: 0,
      minWidth: '50px',
      padding: theme.spacing(0),
      marginLeft: theme.spacing(1),
      lineHeight: 1.5,
    },
    tagsText: {
      width: '100%',
    },
  }),
)

type TagsAutocompleteProps = {
  tagInput: string
  setTagInput: (tagInput: string) => void
  disabled: boolean
}

export default function TagsAutocomplete({
  tagInput,
  setTagInput,
  disabled,
}: TagsAutocompleteProps) {
  const tags = useSelector((state: GoGovReduxState) => state.user.tags)
  const dispatch = useDispatch()
  const setTags = (tags: string[]) => dispatch(userActions.setTags(tags))

  const classes = useStyles()
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [tagAnchorEl, setTagAnchorEl] = useState<HTMLElement | null>(null)

  function resetTagSuggestions() {
    setTagAnchorEl(null)
    setTagSuggestions([])
  }

  useEffect(() => {
    async function getTagSuggestions() {
      const res = await get(`/api/user/tag?searchText=${tagInput}`)
      if (res.status !== 200) return
      const newTagSuggestions: string[] = await res.json()
      // Remove existing tags from tag suggestions
      const filteredTagSuggestions = newTagSuggestions.filter(
        (tagSuggestion) => !tags.includes(tagSuggestion),
      )
      setTagSuggestions(filteredTagSuggestions)
    }

    if (tagInput.length < MIN_TAG_SEARCH_LENGTH || !isValidTag(tagInput)) {
      resetTagSuggestions()
      return () => {}
    }
    const timeoutId = setTimeout(getTagSuggestions, SEARCH_TIMEOUT)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [tagInput])

  return (
    <ClickAwayListener onClickAway={resetTagSuggestions}>
      <div>
        <Autocomplete
          multiple
          freeSolo
          options={['']}
          value={tags}
          disabled={disabled}
          renderTags={(tags) =>
            tags.map((tag) => (
              <FormTag
                key={tag}
                tag={tag}
                onClose={() => setTags(tags.filter((t) => t !== tag))}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              disabled={params.disabled}
              error={!isValidTag(tagInput, true) || tags.includes(tagInput)}
              className={classes.tagsText}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault() // prevent form from submitting
                event.stopPropagation() // prevent freeSolo from clearing text input
                if (isValidTag(tagInput) && !tags.includes(tagInput)) {
                  setTagInput('')
                  setTags([...tags, tagInput])
                }
              }}
              inputProps={params.inputProps}
              InputProps={{
                startAdornment: params.InputProps.startAdornment,
                className: classes.outlinedTagsTextInput,
                classes: {
                  input: classes.tagsTextInput,
                },
              }}
              variant="outlined"
              placeholder={tags.length < MAX_NUM_TAGS_PER_LINK ? 'Add tag' : ''}
              onChange={(event) => {
                setTagInput(event.target.value)
                setTagAnchorEl(event.target)
              }}
              value={tagInput}
              helperText={(() => {
                if (!isValidTag(tagInput, true)) {
                  return `Tags should only consist of letters, numbers and hyphens and be no more than ${MAX_TAG_LENGTH} characters long.`
                }
                if (tags.includes(tagInput)) {
                  return 'This tag already exists.'
                }
                return ''
              })()}
            />
          )}
        />
        <Popper
          open={tagSuggestions.length > 0 && Boolean(tagAnchorEl)}
          anchorEl={tagAnchorEl}
          className={classes.menuPopper}
          placement="bottom-start"
        >
          <Paper className={classes.menuPaper}>
            {tagSuggestions.map((tagSuggestion) => {
              return (
                <Button
                  className={classes.menuButton}
                  key={tagSuggestion}
                  onClick={() => {
                    setTags([...tags, tagSuggestion])
                    setTagInput('')
                    resetTagSuggestions()
                  }}
                >
                  {tagSuggestion}
                </Button>
              )
            })}
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  )
}
