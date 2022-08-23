import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Backdrop,
  Button,
  ClickAwayListener,
  Divider,
  Hidden,
  IconButton,
  InputAdornment,
  TextField,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import filterSortIcon from '@assets/components/user/user-link-table/toolbar/filtersort-icon.svg'
import FilterSortPanel from '../FilterSortPanel'
import userActions from '../../../../actions'
import useSearchInputHeight from './searchInputHeight'
import LinkIcon from '../../../../widgets/LinkIcon'
import TagIcon from '../../../../widgets/TagIcon'
import ArrowDownIcon from '../../../../../app/components/widgets/ArrowDownIcon'
import SearchIcon from '../../../../../app/components/widgets/SearchIcon'
import FilterDrawer from '../../../../../app/components/FilterDrawer'
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
        width: 500,
        flex: '0 1 auto',
      },
    },
    searchTextField: {
      width: '100%',
      height: '100%',
      [theme.breakpoints.up('md')]: {
        maxWidth: 500,
      },
    },
    searchInput: {
      paddingLeft: theme.spacing(0),
    },
    searchbar: {
      display: 'contents',
    },
    searchInputIcon: {
      marginTop: '4px',
      marginLeft: theme.spacing(1.5),
      marginRight: theme.spacing(1),
    },
    searchContainer: {
      width: '100%',
    },
    filterButton: {
      height: '100%',
      paddingLeft: '30px',
      paddingRight: '30px',
      borderRadius: '0px',
    },
    filterIcon: {
      paddingLeft: theme.spacing(0.5),
      verticalAlign: 'middle',
      [theme.breakpoints.down('sm')]: {
        paddingLeft: theme.spacing(0.0),
      },
    },
    buttonWrapper: {
      width: 'auto',
      display: 'inline-flex',
    },
    labelWrapper: {
      verticalAlign: 'middle',
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
  const [query, setQuery] = useState('')

  const tableConfig = useSelector(
    (state: GoGovReduxState) => state.user.tableConfig,
  )
  const searchInputHeight = useSearchInputHeight()
  const classes = useStyles({ textFieldHeight, searchInputHeight })

  const changeSearchTextHandler = (e: string) => {
    setQuery(e)
  }

  const applySearch = () => {
    dispatch(userActions.isFetchingUrls(true))
    dispatch(
      userActions.setUrlTableConfig({
        searchText: query,
        pageNumber: 0,
      } as UrlTableConfig),
    )
    dispatch(userActions.getUrlsForUser())
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applySearch()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [query])

  const [isSortFilterOpen, setIsSortFilterOpen] = useState(false)
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false)
  const [isTag, setIsTag] = useState(false)
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))

  const getSearchLabel = () => {
    if (isMobileView && isTag) {
      return <TagIcon size={20} />
    }
    if (isMobileView && !isTag) {
      return <LinkIcon size={20} />
    }
    return (
      <span className={classes.labelWrapper}>{isTag ? 'Tag' : 'Link'}</span>
    )
  }

  return (
    <ClickAwayListener
      onClickAway={() => {
        setIsSortFilterOpen(false)
        setIsSearchFilterOpen(false)
      }}
    >
      <div className={classes.root}>
        <div className={classes.searchContainer}>
          <TextField
            autoFocus
            className={classes.searchTextField}
            variant="outlined"
            value={query}
            onChange={(e) => changeSearchTextHandler(e.target.value)}
            onBlur={(e) => changeSearchTextHandler(e.target.value)}
            onKeyDown={(e) => {
              const target = e.target as HTMLTextAreaElement
              switch (e.key) {
                case 'Escape':
                  target.value = ''
                  changeSearchTextHandler('')
                  break
                case 'Enter':
                  break
                default:
                  return
              }
              target.blur()
              e.preventDefault()
            }}
            placeholder={isTag ? 'Search tags' : 'Search links'}
            InputProps={{
              classes: { input: classes.input },
              className: classes.searchInput,
              startAdornment: (
                <div className={classes.searchbar}>
                  <Button
                    className={classes.filterButton}
                    onClick={() => setIsSearchFilterOpen(!isSearchFilterOpen)}
                  >
                    <div className={classes.buttonWrapper}>
                      {getSearchLabel()}
                      <ArrowDownIcon
                        className={classes.filterIcon}
                        height={isMobileView ? '20' : '24'}
                        width={isMobileView ? '20' : '24'}
                      />
                    </div>
                  </Button>
                  <Divider orientation="vertical" flexItem />
                  <div className={classes.searchInputIcon}>
                    {isMobileView ? '' : <SearchIcon size={16} />}
                  </div>
                </div>
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
          <FilterDrawer
            labels={['Link', 'Tag']}
            selectedLabel={isTag ? 'Tag' : 'Link'}
            onClick={(label) => {
              setIsTag(label === 'Tag')
              setQuery('')
            }}
            isFilterOpen={isSearchFilterOpen}
            isMobileView={isMobileView}
            setIsFilterOpen={setIsSearchFilterOpen}
          />
        </div>
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
