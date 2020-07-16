import React, { FunctionComponent } from 'react'
import {
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import { ApplyAppMargins } from '../../AppMargins'
import SearchTable from './SearchTable'
import { UrlTypePublic } from '../../../reducers/search/types'

type SearchResultsProps = {
  searchResults: Array<UrlTypePublic>
  pageCount: number
  rowsPerPage: number
  changePageHandler: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    pageNumber: number,
  ) => void
  changeRowsPerPageHandler: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  currentPage: number
  resultsCount: number
  onClickUrl: (shortUrl: string) => void
  query: string
}

const useStyles = makeStyles((theme) =>
  createStyles({
    resultsHeaderText: {
      marginTop: theme.spacing(7.25),
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(11),
      },
    },
    tableWrapper: {
      minHeight: theme.spacing(40),
    },
  }),
)

const SearchResults: FunctionComponent<SearchResultsProps> = ({
  searchResults,
  pageCount,
  rowsPerPage,
  resultsCount,
  currentPage,
  changePageHandler,
  changeRowsPerPageHandler,
  onClickUrl,
  query,
}: SearchResultsProps) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <div className={classes.tableWrapper}>
      <ApplyAppMargins>
        <Typography
          variant={isMobileView ? 'h5' : 'h3'}
          className={classes.resultsHeaderText}
        >
          {`Showing ${resultsCount} links for “${query}”`}
        </Typography>
      </ApplyAppMargins>
      {!!resultsCount && (
        <SearchTable
          searchResults={searchResults}
          pageCount={pageCount}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          changePageHandler={changePageHandler}
          changeRowsPerPageHandler={changeRowsPerPageHandler}
          resultsCount={resultsCount}
          onClickUrl={onClickUrl}
        />
      )}
    </div>
  )
}

export default SearchResults
