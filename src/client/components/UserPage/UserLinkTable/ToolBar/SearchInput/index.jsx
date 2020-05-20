import React from 'react'
import { connect, useSelector } from 'react-redux'
import {
  InputAdornment,
  TextField,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import debounce from 'lodash/debounce'

import userActions from '../../../../../actions/user'
import useMinifiedActions from '../util/minifiedActions'

const mapDispatchToProps = (dispatch) => {
  const debouncedUpdateSearchText = debounce(
    () => dispatch(userActions.getUrlsForUser()),
    500,
  )
  return {
    updateSearchText: (searchText) => {
      dispatch(userActions.setUrlTableConfig({ searchText, pageNumber: 0 }))
      debouncedUpdateSearchText()
    },
  }
}

const useStyles = makeStyles((theme) =>
  createStyles({
    searchInput: {
      display: 'flex',
      flex: (props) => (props.fillWidth ? 1 : 'unset'),
      width: (props) => (props.fillWidth ? 'unset' : 445),
    },
    input: {
      flexGrow: '1',
      height: '100%',
      minHeight: (props) => props.textFieldHeight,
      padding: theme.spacing(0),
      lineHeight: 1.5,
    },
  }),
)

// Height of the text field in the search input.
const textFieldHeight = 48

// Prevents re-render if search input did not change.
const searchInputIsEqual = (prev, next) => {
  return prev.tableConfig.searchText === next.tableConfig.searchText
}

// Search Input field.
const SearchInput = React.memo(({ updateSearchText }) => {
  const tableConfig = useSelector((state) => state.user.tableConfig)
  const fillWidth = useMinifiedActions()
  const classes = useStyles({ fillWidth, textFieldHeight })
  const searchIfChanged = (text) => {
    if (tableConfig.searchText !== text) {
      updateSearchText(text)
    }
  }
  const changeSearchTextHandler = (event) => {
    searchIfChanged(event.target.value)
  }
  const clearSearchTextHandler = () => {
    searchIfChanged('')
  }

  return (
    <TextField
      autoFocus
      className={classes.searchInput}
      variant="outlined"
      value={tableConfig.searchText}
      onChange={changeSearchTextHandler}
      onBlur={changeSearchTextHandler}
      onKeyDown={(e) => {
        switch (e.key) {
          case 'Escape':
            e.target.value = ''
            clearSearchTextHandler()
            break
          case 'Enter':
            break
          default:
            return
        }
        e.target.blur()
        e.preventDefault()
      }}
      placeholder="Search links"
      InputProps={{
        classes: { input: classes.input },
        startAdornment: (
          <InputAdornment position="start">
            <box-icon name="search" />
          </InputAdornment>
        ),
      }}
    />
  )
}, searchInputIsEqual)

export default connect(null, mapDispatchToProps)(SearchInput)
