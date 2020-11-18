import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
import userActions from '../../../../actions'
import filterSortIcon from '../assets/filtersort-icon.svg'
import useSearchInputHeight from './searchInputHeight'
import SearchIcon from '../../../../../app/components/widgets/SearchIcon'
import { UrlTableConfig } from '../../../../reducers/types'
import { GoGovReduxState } from '../../../../../app/reducers/types'

type StyleProps = {
  searchInputHeight: number
  textFieldHeight: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      height: (props: StyleProps) => props.searchInputHeight,
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
      flexGrow: 1,
      height: '100%',
      minHeight: (props: StyleProps) => props.textFieldHeight,
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
const textFieldHeight = useSearchInputHeight()

// Search Input field.
const SearchInput = () => {
  const dispatch = useDispatch()
  const debouncedUpdateSearchText = debounce(
    () => dispatch(userActions.getUrlsForUser()),
    500,
  )
  const updateSearchText = (searchText: Partial<UrlTableConfig>) => {
    dispatch(userActions.isFetchingUrls(true))
    dispatch(userActions.setUrlTableConfig({ searchText, pageNumber: 0 } as UrlTableConfig))
    debouncedUpdateSearchText()
  }

  const tableConfig = useSelector((state: GoGovReduxState) => state.user.tableConfig)
  const searchInputHeight = useSearchInputHeight()
  const classes = useStyles({ textFieldHeight, searchInputHeight })
  const searchIfChanged = (text: Partial<UrlTableConfig>) => {
    if (tableConfig.searchText !== text) {
      updateSearchText(text)
    }
  }
  const changeSearchTextHandler = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    searchIfChanged(event.target.value as Partial<UrlTableConfig>)
  }
  const clearSearchTextHandler = () => {
    searchIfChanged('' as Partial<UrlTableConfig>)
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
            const target = e.target as HTMLTextAreaElement
            switch (e.key) {
              case 'Escape':
                target.value = ''
                clearSearchTextHandler()
                break
              case 'Enter':
                break
              default:
                return
            }
            target.blur()
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
}

export default SearchInput
