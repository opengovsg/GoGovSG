import React, { FunctionComponent, useEffect, useState } from 'react'
import {
  ClickAwayListener,
  IconButton,
  TextField,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
  Divider,
  Button,
} from '@material-ui/core'
import CloseIcon from '../CloseIcon'
import SearchSortIcon from '../SearchSortIcon'
import SearchIcon from '../SearchIcon'
import EmailIcon from '../EmailIcon'
import { sortOptions } from '../../../constants/directory'
import { SearchResultsSortOrder } from '../../../../shared/search'
import SortDrawer from './SortDrawer'
import ArrowDownIcon from './SortDrawer/widgets/ArrowDownIcon'
import FilterDrawer from './FilterDrawer'

type GoSearchInputProps = {
  showAdornments?: boolean
  onQueryChange?: (query: string) => void
  onSortOrderChange?: (order: SearchResultsSortOrder) => void
  onClearQuery?: () => void
  onKeyPress?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  query: string
  getFile:(queryFile: string) => void
  getState:(queryState: string) => void
  getEmail:(queryEmail: string) => void
  onApply: () => void
  onReset: () => void
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '44px',
      [theme.breakpoints.up('md')]: {
        height: '70px',
      },
    },
    searchTextField: {
      width: '100%',
      height: '100%',
      '& input::-webkit-search-decoration, & input::-webkit-search-cancel-button, & input::-webkit-search-results-button, & input::-webkit-search-results-decoration': {
        display: 'none',
      },
    },
    searchInput: {
      height: '100%',
      background: 'white',
      boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.25)',
      borderRadius: '5px',
      border: 0,
      paddingRight: 0,
      paddingLeft: 0,
      [theme.breakpoints.up('md')]: {
        paddingRight: theme.spacing(2),
        paddingLeft: theme.spacing(2),
      },
    },
    searchInputNested: {
      [theme.breakpoints.up('md')]: {
        fontSize: '1rem',
      },
    },
    searchInputIcon: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(1),
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(2.5),
      },
    },
    searchbar:{
      display: 'contents'
    },
    searchOptionsButton: {
      padding: theme.spacing(0.75),
      marginRight: theme.spacing(1.5),
      [theme.breakpoints.up('md')]: {
        marginRight: theme.spacing(2.5),
        padding: theme.spacing(1.5),
      },
    },
    closeButton: {
      padding: theme.spacing(0.75),
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(1.5),
      },
    },
    sortPanel: {
      width: theme.spacing(50),
      right: 0,
      left: 'auto',
    },
    filterButton: {
      paddingLeft: theme.spacing(1.5),
    },
    filterDivider: {
      marginLeft: theme.spacing(1.0),
    },
    filterIcon: {
      paddingLeft: theme.spacing(1.5),
    },
  }),
)

const GoDirectoryInput: FunctionComponent<GoSearchInputProps> = ({
  showAdornments,
  query,
  onQueryChange = () => {},
  onSortOrderChange = () => {},
  onClearQuery = () => {},
  onKeyPress = () => {},
  getFile = () => {},
  getState = () => {},
  getEmail = () => {},
  onApply = () => {},
  onReset = () => {},
}: GoSearchInputProps) => {
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isEmail, setIsEmail] = useState<boolean>(true)
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))

  // Checks and assign email variable
  useEffect(() => {
    if(isEmail) {
      getEmail('true')
    } 
    else {
      getEmail('false')
    }
  }, [isEmail])

  // Label for the button - requires double conditions
  const getSearchLabel = (isEmail: boolean, isMobileView: boolean) => {
    if (isMobileView && isEmail) {
      return (<EmailIcon size={isMobileView ? 16 : 30} />)
    } 
    else if (isMobileView && !isEmail) {
      return (<SearchIcon size={isMobileView ? 16 : 30} />)
    } 
    else if (!isMobileView && isEmail) {
      return 'Email'
    }
    else {
      return 'Keyword'
    }
  }

  // Icon for search bar 
  const getSearchIcon = (isEmail: boolean, isMobileView:boolean) => {
    if (isMobileView) {
      return ''
    } 
    else if (isEmail) {
      return (<EmailIcon size={isMobileView ? 16 : 30} />)
    }
    else {
      return (<SearchIcon size={isMobileView ? 16 : 30} />)
    }
  }

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (!isMobileView) {
          setIsSortPanelOpen(false)
        }
        setIsFilterOpen(false)
      }}
    >
      <div className={classes.root}>
        <TextField
          autoFocus
          type="search"
          className={classes.searchTextField}
          placeholder={isEmail? "Enter an email or email domain e.g. @mom.gov.sg": "Enter a keyword"}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyPress={onKeyPress}
          variant="outlined"
          InputProps={{
            className: classes.searchInput,
            startAdornment: (
                <div className={classes.searchbar}>
                  <Button
                    className={classes.filterButton}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    {getSearchLabel(isEmail, isMobileView)}
                  </Button>
                  <ArrowDownIcon 
                      className={classes.filterIcon}/>
                    <Divider 
                      className={classes.filterDivider}
                      orientation="vertical" flexItem />
                  <div className={classes.searchInputIcon}>
                    {getSearchIcon(isEmail, isMobileView)}
                  </div>
              </div>

            ),
            endAdornment: (
              <>
                {showAdornments && (
                  <>
                    {query && (
                      <IconButton
                        onClick={onClearQuery}
                        className={classes.closeButton}
                      >
                        <CloseIcon
                          size={isMobileView ? 20 : 24}
                          color="#BBBBBB"
                        />
                      </IconButton>
                    )}
                    <IconButton
                      className={classes.searchOptionsButton}
                      onClick={() => setIsSortPanelOpen(true)}
                    >
                      <SearchSortIcon size={isMobileView ? 20 : 30} />
                    </IconButton>
                  </>
                )}
              </>
            ),
          }}
          // TextField takes in two separate inputProps and InputProps,
          // each having its own purpose.
          // eslint-disable-next-line react/jsx-no-duplicate-props
          inputProps={{
            className: classes.searchInputNested,
            onClick: () => setIsSortPanelOpen(false),
          }}
        />
          <FilterDrawer 
            onClick={setIsEmail}
            selected={isEmail}
            isFilterOpen={isFilterOpen}
            isMobileView={isMobileView}
            setIsFilterOpen={setIsFilterOpen}
          />
        

          <SortDrawer
            open={isSortPanelOpen}
            onClose={() => setIsSortPanelOpen(false)}
            onChoose={onSortOrderChange}
            options={sortOptions}
            getFile={getFile}
            getState={getState}
            onApply={onApply}
            onReset={onReset}
          />
      </div>
    </ClickAwayListener>
  )
}

export default GoDirectoryInput
