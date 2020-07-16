import React, { FunctionComponent, useEffect, useState } from 'react'
import {
  Hidden,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import querystring from 'querystring'
import debounce from 'lodash/debounce'
import { History } from 'history'
import BaseLayout from '../BaseLayout'
import { GoGovReduxState } from '../../reducers/types'
import useAppMargins from '../AppMargins/appMargins'
import searchActions from '../../actions/search'
import { SEARCH_PAGE } from '../../util/types'
import { SearchResultsSortOrder } from '../../../shared/search'
import SearchHeader from './SearchHeader'
import InfoDrawer from './InfoDrawer'
import SearchResults from './SearchResults'
import EmptyStateGraphic from './EmptySearchGraphic'

type GoSearchParams = {
  query: string
  sortOrder: SearchResultsSortOrder
  rowsPerPage: number
  currentPage: number
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      height: '100vh',
      overflowY: 'auto',
      zIndex: 1,
    },
  }),
)

type SearchPageProps = {}

const defaultParams: GoSearchParams = {
  query: '',
  sortOrder: SearchResultsSortOrder.Relevance,
  rowsPerPage: 10,
  currentPage: 0,
}

const redirectWithParams = (newParams: GoSearchParams, history: History) => {
  const newPath = {
    pathname: SEARCH_PAGE,
    search: `${querystring.stringify(newParams)}`,
  }
  history.push(newPath)
}

const updateQueryDebounced = debounce(redirectWithParams, 500)

const SearchPage: FunctionComponent<SearchPageProps> = () => {
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()
  const [pendingQuery, setPendingQuery] = useState('')
  const [selectedShortUrl, setSelectedShortUrl] = useState<string>()
  const urlParams = querystring.parse(location.search.substring(1)) as Partial<
    GoSearchParams
  >
  const params: GoSearchParams = {
    ...defaultParams,
    ...urlParams,
  }
  const { query, sortOrder } = params
  const rowsPerPage = Number(params.rowsPerPage)
  const currentPage = Number(params.currentPage)
  const getResults = () =>
    dispatch(
      searchActions.getSearchResults(
        query,
        sortOrder,
        rowsPerPage,
        currentPage,
      ),
    )
  const resultsCount = useSelector(
    (state: GoGovReduxState) => state.search.resultsCount,
  )
  const queryForResult = useSelector(
    (state: GoGovReduxState) => state.search.queryForResult,
  )
  const searchResults = useSelector(
    (state: GoGovReduxState) => state.search.results,
  )

  const selectedUrl = searchResults.find(
    (url) => url.shortUrl === selectedShortUrl,
  )

  const onQueryChange = (newQuery: string) => {
    setPendingQuery(newQuery)
    updateQueryDebounced(
      {
        ...params,
        query: newQuery,
      },
      history,
    )
  }

  const onSortOrderChange = (newSortOrder: SearchResultsSortOrder) => {
    redirectWithParams(
      {
        ...params,
        sortOrder: newSortOrder,
      },
      history,
    )
  }

  const onClearQuery = () => {
    setPendingQuery('')
  }

  const pageCount = Math.ceil(resultsCount / rowsPerPage)

  const changePageHandler = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    pageNumber: number,
  ) => {
    redirectWithParams(
      {
        ...params,
        currentPage: pageNumber,
      },
      history,
    )
  }

  const changeRowsPerPageHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    redirectWithParams(
      {
        ...params,
        currentPage: 0,
        rowsPerPage: parseInt(event.target.value, 10),
      },
      history,
    )
  }

  const onClickUrl = (shortUrl: string) => {
    if (isMobileView) {
      setSelectedShortUrl(shortUrl)
    } else {
      window.location.assign(
        `${document.location.protocol}//${document.location.host}/${shortUrl}`,
      )
    }
  }

  const queryToDisplay = (queryForResult || '').trim()

  useEffect(() => {
    if (!query) {
      return
    }
    setPendingQuery(query)
    getResults()
  }, [query, sortOrder, rowsPerPage, currentPage])

  return (
    <div className={classes.root}>
      <BaseLayout headerBackgroundType="darkest">
        <SearchHeader
          onQueryChange={onQueryChange}
          query={pendingQuery}
          onSortOrderChange={onSortOrderChange}
          sortOrder={sortOrder}
          onClearQuery={onClearQuery}
        />
        {queryToDisplay ? (
          <SearchResults
            searchResults={searchResults}
            pageCount={pageCount}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            changePageHandler={changePageHandler}
            changeRowsPerPageHandler={changeRowsPerPageHandler}
            resultsCount={resultsCount}
            onClickUrl={onClickUrl}
            query={queryToDisplay}
          />
        ) : (
          <EmptyStateGraphic />
        )}
        <Hidden mdUp>
          <InfoDrawer
            selectedUrl={selectedUrl}
            onClose={() => setSelectedShortUrl(undefined)}
          />
        </Hidden>
      </BaseLayout>
    </div>
  )
}

export default SearchPage
