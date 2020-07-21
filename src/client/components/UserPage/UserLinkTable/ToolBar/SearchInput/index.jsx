import React, { useState } from 'react'
import { connect, useSelector } from 'react-redux'
import {
  Backdrop,
  ClickAwayListener,
  Hidden,
  IconButton,
  InputAdornment,
  TextField,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import debounce from 'lodash/debounce'
import FilterSortPanel from '../FilterSortPanel'

import userActions from '../../../../../actions/user'

import filterSortIcon from '../assets/filtersort-icon.svg'
import useSearchInputHeight from './searchInputHeight'
import SearchIcon from '../../../../widgets/SearchIcon'

const mapDispatchToProps = (dispatch) => {
  const debouncedUpdateSearchText = debounce(
    () => dispatch(userActions.getUrlsForUser()),
    500,
  )
  return {
    updateSearchText: (searchText) => {
      dispatch(userActions.isFetchingUrls(true))
      dispatch(userActions.setUrlTableConfig({ searchText, pageNumber: 0 }))
      debouncedUpdateSearchText()
    },
  }
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      height: (props) => props.searchInputHeight,
      flex: 1,
      width: 'unset',
      [theme.breakpoints.up('md')]: {
        position: 'relative',
        width: 445,
        flex: '0 1 auto',
      },
    },
    searchInput: {
      width: '100%',
      [theme.breakpoints.up('md')]: {
        maxWidth: 445,
      },
    },
    input: {
      flexGrow: '1',
      height: '100%',
      minHeight: (props) => props.textFieldHeight,
      padding: theme.spacing(0),
      lineHeight: 1.5,
    },
    panelBackdrop: {
      zIndex: 999,
      position: 'fixed',
      height: '100vh',
      width: '100vw',
    },
    filterSortButton: {
      marginRight: '-12px',
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
  const searchInputHeight = useSearchInputHeight()
  const classes = useStyles({ textFieldHeight, searchInputHeight })
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
  const [isSortFilterOpen, setIsSortFilterOpen] = useState(false)

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (isSortFilterOpen) setIsSortFilterOpen(false)
      }}
    >
      <div className={classes.root}>
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
                <SearchIcon size={16} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  className={classes.filterSortButton}
                  onClick={() => setIsSortFilterOpen(!isSortFilterOpen)}
                >
                  <img src={filterSortIcon} alt="Filter and sort icon" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FilterSortPanel
          isOpen={isSortFilterOpen}
          onClose={() => setIsSortFilterOpen(false)}
          tableConfig={tableConfig}
        />
        <Hidden mdUp>
          <Backdrop className={classes.panelBackdrop} open={isSortFilterOpen} />
        </Hidden>
      </div>
    </ClickAwayListener>
  )
}, searchInputIsEqual)

export default connect(null, mapDispatchToProps)(SearchInput)
