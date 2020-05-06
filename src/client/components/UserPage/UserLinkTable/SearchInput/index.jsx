import React from 'react'
import { connect, useSelector } from 'react-redux'
import {
  InputAdornment,
  TextField,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import debounce from 'lodash/debounce'

import userActions from '../../../../actions/user'
import CreateLinkButton from './CreateLinkButton'

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
    searchInputBar: {
      display: 'flex',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      width: '100%',
    },
    searchInput: {
      width: '100%',
      marginRight: theme.spacing(2),
    },
  }),
)

// Prevents re-render if search input did not change.
const searchInputIsEqual = (prev, next) => {
  return prev.tableConfig.searchText === next.tableConfig.searchText
}

// Search Input field.
const SearchInput = React.memo(({ updateSearchText }) => {
  const tableConfig = useSelector((state) => state.user.tableConfig)
  const classes = useStyles()
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
    <div className={classes.searchInputBar}>
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
          startAdornment: (
            <InputAdornment position="start">
              <box-icon name="search" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" onClick={clearSearchTextHandler}>
              <box-icon name="filter" />
            </InputAdornment>
          ),
        }}
      />
      <CreateLinkButton />
    </div>
  )
}, searchInputIsEqual)

export default connect(null, mapDispatchToProps)(SearchInput)
