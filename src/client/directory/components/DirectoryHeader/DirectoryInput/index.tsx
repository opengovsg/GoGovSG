import React, { FunctionComponent, useEffect, useState } from 'react'
import {
  Button,
  ClickAwayListener,
  Divider,
  IconButton,
  TextField,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import CloseIcon from '../../../../app/components/widgets/CloseIcon'
import SearchSortIcon from '../../../../app/components/widgets/SearchSortIcon'
import SearchIcon from '../../../../app/components/widgets/SearchIcon'
import EmailIcon from '../../../../app/components/widgets/EmailIcon'
import { sortOptions } from '../../../constants'
import { SearchResultsSortOrder } from '../../../../../shared/search'
import SortDrawer from './SortDrawer'
import ArrowDownIcon from './SortDrawer/widgets/ArrowDownIcon'
import FilterDrawer from './FilterDrawer'

type DirectoryInputProps = {
  showAdornments?: boolean
  onQueryChange?: (query: string) => void
  onSortOrderChange?: (order: SearchResultsSortOrder) => void
  onClearQuery?: () => void
  onKeyPress?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  query: string
  getFile: (queryFile: string) => void
  getState: (queryState: string) => void
  getEmail: (queryEmail: string) => void
  setDisablePagination: (disablePagination: boolean) => void
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
      },
    },
    searchInputNested: {
      [theme.breakpoints.up('md')]: {
        fontSize: '1rem',
      },
    },
    searchInputIcon: {
      marginTop: '6px',
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(1),
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(2.5),
      },
    },
    searchbar: {
      display: 'contents',
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
  }),
)

const noOp = () => {}

/**
 * @component Search bar with filter panel and sort panel.
 */
const DirectoryInput: FunctionComponent<DirectoryInputProps> = ({
  showAdornments,
  query,
  onQueryChange = noOp,
  onSortOrderChange = noOp,
  onClearQuery = noOp,
  onKeyPress = noOp,
  getFile = noOp,
  getState = noOp,
  getEmail = noOp,
  onApply = noOp,
  onReset = noOp,
  setDisablePagination = noOp,
}: DirectoryInputProps) => {
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isEmail, setIsEmail] = useState<boolean>(false)
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))

  // Checks and assign email variable
  useEffect(() => {
    if (isEmail) {
      getEmail('true')
    } else {
      getEmail('false')
    }
  }, [isEmail])

  // If sort panel is open, set pagination z-index to -1, else reset z-index to 1
  // this prevent pagination from intersecting with sort panel
  useEffect(() => {
    if (isSortPanelOpen) {
      setDisablePagination(true)
    } else {
      setDisablePagination(false)
    }
  }, [isSortPanelOpen])

  // Label for the button - requires double conditions
  const getSearchLabel = () => {
    if (isMobileView && isEmail) {
      return <EmailIcon size={20} />
    }
    if (isMobileView && !isEmail) {
      return <SearchIcon size={20} />
    }
    if (!isMobileView && isEmail) {
      return 'Email'
    }

    return 'Keyword'
  }

  // Icon for search bar
  const getSearchIcon = () => {
    if (isMobileView) {
      return ''
    }
    if (isEmail) {
      return <EmailIcon size={isMobileView ? 30 : 30} />
    }

    return <SearchIcon size={isMobileView ? 30 : 30} />
  }

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (!isMobileView) {
          setIsSortPanelOpen(false)
        }
        setIsFilterOpen(false)
        setDisablePagination(false)
      }}
    >
      <div className={classes.root}>
        <TextField
          autoFocus
          type="search"
          className={classes.searchTextField}
          placeholder={
            isEmail
              ? 'Enter an email or email domain e.g. @mom.gov.sg'
              : 'Enter a keyword'
          }
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
                  <div className={classes.buttonWrapper}>
                    {isMobileView ? (
                      getSearchLabel()
                    ) : (
                      <span className={classes.labelWrapper}>
                        {getSearchLabel()}
                      </span>
                    )}
                    {isMobileView ? (
                      <ArrowDownIcon
                        className={classes.filterIcon}
                        height="20"
                        width="20"
                      />
                    ) : (
                      <ArrowDownIcon
                        className={classes.filterIcon}
                        height="24"
                        width="24"
                      />
                    )}
                  </div>
                </Button>

                <Divider orientation="vertical" flexItem />
                <div className={classes.searchInputIcon}>{getSearchIcon()}</div>
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

export default DirectoryInput
