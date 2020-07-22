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
import useAppMargins from '../../AppMargins/appMargins'

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

type SearchResultsStyleProps = {
  appMargins: number
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
      width: (_: SearchResultsStyleProps) => '100%',
      margin: '0 auto',
      minHeight: theme.spacing(40),
      [theme.breakpoints.up(1440)]: {
        width: (props: SearchResultsStyleProps) =>
          `${theme.spacing(180) - 2 * props.appMargins}px`,
      },
    },
    ignoreMargin: {
      [theme.breakpoints.up(1440)]: {
        marginLeft: 0,
        marginRight: 0,
      },
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
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <div className={classes.tableWrapper}>
      <ApplyAppMargins className={classes.ignoreMargin}>
        <Typography
          variant={isMobileView ? 'h5' : 'h3'}
          className={classes.resultsHeaderText}
        >
          {!!resultsCount &&
            `Showing ${resultsCount} link${
              resultsCount > 1 ? 's' : ''
            } for “${query}”`}
          {!resultsCount && `No links found for “${query}”`}
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
