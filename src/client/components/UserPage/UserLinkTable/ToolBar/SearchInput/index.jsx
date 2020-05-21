import React, { useState } from 'react'
import { connect, useSelector } from 'react-redux'
import {
  ClickAwayListener,
  IconButton,
  InputAdornment,
  TextField,
  createStyles,
  makeStyles,
  Hidden,
  Backdrop,
} from '@material-ui/core'
import debounce from 'lodash/debounce'
import FilterSortPanel from '../FilterSortPanel'

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
      [theme.breakpoints.up('md')]: {
        position: 'relative',
      },
    },
    input: {
      flexGrow: '1',
      height: '100%',
      minHeight: (props) => props.textFieldHeight,
      padding: theme.spacing(0),
      lineHeight: 1.5,
    },
    closeIcon: {
      position: 'absolute',
      top: 0,
      right: 0,
      margin: 8,
    },
    panelBackdrop: {
      zIndex: 999,
      position: 'fixed',
      height: '100vh',
      width: '100vw',
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
  const [isSortFilterOpen, setIsSortFilterOpen] = useState(false)

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (isSortFilterOpen) setIsSortFilterOpen(false)
      }}
    >
      <div className={classes.searchInput}>
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
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setIsSortFilterOpen(!isSortFilterOpen)}
                >
                  <box-icon name="slider" />
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
