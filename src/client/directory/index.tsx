import React, { FunctionComponent, useEffect, useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import querystring from 'querystring'
import debounce from 'lodash/debounce'
import { History } from 'history'
import BaseLayout from '../app/components/BaseLayout'
import { GoGovReduxState } from '../app/reducers/types'
import useAppMargins from '../app/components/AppMargins/appMargins'
import directoryActions from './actions'
import { DIRECTORY_PAGE } from '../app/util/types'
import { SearchResultsSortOrder } from '../../shared/search'
import DirectoryHeader from './components/DirectoryHeader'
import DirectoryResults from './components/DirectoryResults'
import EmptyStateGraphic from './components/EmptySearchGraphic'
import { defaultSortOption } from './constants'
import { GAEvent, GAPageView } from '../app/util/ga'

/**
 * Search query parameters for calling directory endpoint.
 */
type GoSearchParams = {
  query: string
  sortOrder: SearchResultsSortOrder
  rowsPerPage: number
  currentPage: number
  state: string
  isFile: string
  isEmail: string
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      height: '100vh',
      overflowY: 'auto',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 0,
      '-ms-flex': '1 1 auto',
    },
  }),
)

type SearchPageProps = {}

/**
 * Search query default parameters.
 */
const defaultParams: GoSearchParams = {
  query: '',
  sortOrder: defaultSortOption,
  rowsPerPage: 10,
  currentPage: 0,
  state: '',
  isFile: '',
  isEmail: 'false',
}

/**
 * Redirect back to directory page with parameters that are different from default parameters.
 */
const redirectWithParams = (newParams: GoSearchParams, history: History) => {
  const queryObject: any = { query: newParams.query }
  Object.entries(newParams).map(([key, value], _) => {
    if (value && value !== (defaultParams as any)[key]) {
      queryObject[key] = value
    }
    return
  })
  const newPath = {
    pathname: DIRECTORY_PAGE,
    search: `${querystring.stringify(queryObject)}`,
  }
  history.push(newPath)
}

const updateQueryDebounced = debounce(redirectWithParams, 500)

/**
 * @component Directory page root component.
 */
const SearchPage: FunctionComponent<SearchPageProps> = () => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()
  const [pendingQuery, setPendingQuery] = useState('')
  const [queryFile, setQueryFile] = useState<string>(defaultParams.isFile)
  const [querystate, setQueryState] = useState<string>(defaultParams.state)
  const [queryEmail, setQueryEmail] = useState<string>(defaultParams.isEmail)
  const [queryOrder, setQueryOrder] = useState<SearchResultsSortOrder>(
    defaultParams.sortOrder,
  )
  const [disablePagination, setDisablePagination] = useState<boolean>(false)

  /**
   * Search parameters that includes the latest changes and retain default values for the others.
   */
  const urlParams = querystring.parse(
    location.search.substring(1),
  ) as Partial<GoSearchParams>
  const params: GoSearchParams = {
    ...defaultParams,
    ...urlParams,
  }
  const { query, sortOrder, state, isFile, isEmail } = params
  const rowsPerPage = Number(params.rowsPerPage)
  const currentPage = Number(params.currentPage)
  const rankOffset = rowsPerPage * currentPage
  /** Dispatch action to get new results. */
  const getResults = () =>
    dispatch(
      directoryActions.getDirectoryResults(
        query,
        sortOrder,
        rowsPerPage,
        currentPage,
        state,
        isFile,
        isEmail,
      ),
    )

  const resultsCount = useSelector(
    (state: GoGovReduxState) => state.directory.resultsCount,
  )
  const queryForResult = useSelector(
    (state: GoGovReduxState) => state.directory.queryForResult,
  )
  const searchResults = useSelector(
    (state: GoGovReduxState) => state.directory.results,
  )

  const pageCount = Math.ceil(resultsCount / rowsPerPage)

  const onQueryChange = (newQuery: string) => {
    setPendingQuery(newQuery)
    updateQueryDebounced(
      {
        ...params,
        query: newQuery,
        state: querystate,
        isFile: queryFile,
        isEmail: queryEmail,
        sortOrder: queryOrder,
        currentPage:
          newQuery === params.query
            ? params.currentPage
            : defaultParams.currentPage,
      },
      history,
    )
  }

  /** Redirect when sort order, type or state changes. */
  const applyChanges = () => {
    if (
      !(queryFile === params.isFile) ||
      !(querystate === params.state) ||
      !(queryOrder === params.sortOrder)
    ) {
      redirectWithParams(
        {
          ...params,
          state: querystate,
          isFile: queryFile,
          sortOrder: queryOrder,
          isEmail: queryEmail,
          currentPage: defaultParams.currentPage,
        },
        history,
      )
    }
  }

  /** Reset all parameters to default. */
  const onResetFilter = () => {
    // Ensure same differences will not be pushed to history
    if (
      !(queryFile === defaultParams.isFile) ||
      !(querystate === defaultParams.state) ||
      !(queryOrder === defaultParams.sortOrder)
    ) {
      redirectWithParams(
        {
          ...defaultParams,
          query,
          isEmail: queryEmail,
        },
        history,
      )
    }
  }
  // Google Analytics
  useEffect(() => {
    GAEvent('directory page', 'main')
    GAPageView('DIRECTORY PAGE')
  }, [])

  // Redirect when queryEmail changes
  useEffect(() => {
    setPendingQuery('')
    dispatch(directoryActions.resetDirectoryResults())
    redirectWithParams(
      {
        ...defaultParams,
        state: querystate,
        isFile: queryFile,
        sortOrder: queryOrder,
        isEmail: queryEmail,
      },
      history,
    )
  }, [queryEmail])

  const onClearQuery = () => {
    setPendingQuery('')
  }

  /** Redirect when page number changes. */
  const changePageHandler = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    pageNumber: number,
  ) => {
    redirectWithParams(
      {
        ...params,
        state: querystate,
        isFile: queryFile,
        sortOrder: queryOrder,
        isEmail: queryEmail,
        currentPage: pageNumber,
      },
      history,
    )
  }

  /** Redirect when rows per page changes. */
  const changeRowsPerPageHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    redirectWithParams(
      {
        ...params,
        state: querystate,
        isFile: queryFile,
        sortOrder: queryOrder,
        isEmail: queryEmail,
        currentPage: 0,
        rowsPerPage: parseInt(event.target.value, 10),
      },
      history,
    )
  }

  const queryToDisplay = (queryForResult || '').trim()
  // detect changes in query
  useEffect(() => {
    if (!query) {
      return
    }
    setPendingQuery(query)
    getResults()
  }, [query, sortOrder, rowsPerPage, currentPage, state, isFile, isEmail])

  return (
    <div className={classes.root}>
      <BaseLayout headerBackgroundType="darkest" hideNavButtons={false}>
        <DirectoryHeader
          onQueryChange={onQueryChange}
          query={pendingQuery}
          onSortOrderChange={setQueryOrder}
          onClearQuery={onClearQuery}
          getFile={setQueryFile}
          getState={setQueryState}
          getEmail={setQueryEmail}
          onApply={applyChanges}
          onReset={onResetFilter}
          setDisablePagination={setDisablePagination}
        />
        {queryToDisplay ? (
          <DirectoryResults
            searchResults={searchResults}
            pageCount={pageCount}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            changePageHandler={changePageHandler}
            changeRowsPerPageHandler={changeRowsPerPageHandler}
            resultsCount={resultsCount}
            query={queryToDisplay}
            disablePagination={disablePagination}
            rankOffset={rankOffset}
          />
        ) : (
          <EmptyStateGraphic />
        )}
      </BaseLayout>
    </div>
  )
}

export default SearchPage
