import React from 'react'
import { TextField, createStyles, makeStyles } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { isValidTag } from '../../../shared/util/validation'
import { TEXT_FIELD_HEIGHT } from '../components/CreateUrlModal/FormStartAdorment' // TODO
import FormTag from './FormTag'

const useStyles = makeStyles((theme) =>
  createStyles({
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
  tags: string[]
  setTags: (tags: string[]) => void
  tagInput: string
  setTagInput: (tagInput: string) => void
  disabled: boolean
  placeholder: string
}

export default function TagsAutocomplete({
  tags,
  setTags,
  tagInput,
  setTagInput,
  disabled,
  placeholder,
}: TagsAutocompleteProps) {
  const classes = useStyles()
  return (
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
            event.stopPropagation()
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
          placeholder={placeholder}
          onChange={(event) => {
            setTagInput(event.target.value)
          }}
          value={tagInput}
          helperText={(() => {
            if (!isValidTag(tagInput, true)) {
              return 'Tags should only consist of letters, numbers and hyphens and be no more than 25 characters long.'
            }
            if (tags.includes(tagInput)) {
              return 'This tag already exists.'
            }
            return ''
          })()}
        />
      )}
    />
  )
}
