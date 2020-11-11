import React, { FunctionComponent } from 'react'
import { Table, TableBody, createStyles, makeStyles } from '@material-ui/core'
import { UrlTypePublic } from '../../reducers/types'
import SearchTableRow from './SearchTableRow'
import SearchTablePagination from './SearchTablePagination'

type SearchTableProps = {
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
}

const useStyles = makeStyles((theme) =>
  createStyles({
    resultsTable: {
      maxWidth: theme.spacing(180),
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(3),
      },
    },
  }),
)

const SearchTable: FunctionComponent<SearchTableProps> = React.memo(
  ({
    searchResults,
    pageCount,
    rowsPerPage,
    resultsCount,
    currentPage,
    changePageHandler,
    changeRowsPerPageHandler,
    onClickUrl,
  }: SearchTableProps) => {
    const classes = useStyles()
    return (
      <Table aria-label="search results table" className={classes.resultsTable}>
        <TableBody>
          {searchResults.map((url: UrlTypePublic) => (
            <SearchTableRow url={url} onClickUrl={onClickUrl} />
          ))}
          <SearchTablePagination
            pageCount={pageCount}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            changePageHandler={changePageHandler}
            changeRowsPerPageHandler={changeRowsPerPageHandler}
            resultsCount={resultsCount}
          />
        </TableBody>
      </Table>
    )
  },
)

export default SearchTable
