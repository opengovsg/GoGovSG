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

// might carry this over to constants/directory instead
const defaultParams: GoSearchParams = {
  query: '',
  sortOrder: defaultSortOption,
  rowsPerPage: 10,
  currentPage: 0,
  state: '',
  isFile: '',
  isEmail: 'false',
}

const redirectWithParams = (newParams: GoSearchParams, history: History) => {
  const queryObject: any = { query: newParams.query }
  for (const [key, value] of Object.entries(newParams)) {
    if (value && value !== (defaultParams as any)[key]) {
      queryObject[key] = value
    }
  }
  const newPath = {
    pathname: DIRECTORY_PAGE,
    search: `${querystring.stringify(queryObject)}`,
  }
  history.push(newPath)
}

const updateQueryDebounced = debounce(redirectWithParams, 500)

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

  // When the query changes
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

  // When applying changes after filtering order, file type and state
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

  // reset
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

  // Changes when queryEmail changes
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

  // When changing page
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

  // When changing number of rows in a page
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
          />
        ) : (
          <EmptyStateGraphic />
        )}
      </BaseLayout>
    </div>
  )
}

export default SearchPage
