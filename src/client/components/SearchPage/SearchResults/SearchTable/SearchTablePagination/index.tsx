import React, { FunctionComponent } from 'react'
import {
  TableCell,
  TablePagination,
  TableRow,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import useAppMargins from '../../../../AppMargins/appMargins'
import PaginationActionComponent from '../../../../widgets/PaginationActionComponent'

type SearchTablePaginationProps = {
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
}

type SearchTablePaginationStyleProps = {
  appMargins: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    pagination: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(6),
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(6.5),
      },
    },
    paginationCell: {
      padding: 0,
      border: 'none',
      width: '100%',
    },
    paginationRow: {
      height: 'fit-content',
      border: 'none',
    },
    toolbar: {
      paddingLeft: (props: SearchTablePaginationStyleProps) => props.appMargins,
      paddingRight: (props: SearchTablePaginationStyleProps) =>
        props.appMargins,
    },
    spacer: {
      flex: 0,
    },
    caption: {
      fontWeight: 400,
      marginRight: '4px',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    select: {
      border: 'solid 1px #d8d8d8',
      zIndex: 2,
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    selectIcon: {
      zIndex: 2,
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  }),
)

const SearchTablePagination: FunctionComponent<SearchTablePaginationProps> = ({
  pageCount,
  rowsPerPage,
  resultsCount,
  currentPage,
  changePageHandler,
  changeRowsPerPageHandler,
}: SearchTablePaginationProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  return (
    <TableRow key="pagination" className={classes.paginationRow}>
      <TableCell className={classes.paginationCell}>
        <TablePagination
          className={classes.pagination}
          ActionsComponent={({ onChangePage, page }) => (
            <PaginationActionComponent
              pageCount={pageCount}
              onChangePage={onChangePage}
              page={page}
            />
          )}
          labelRowsPerPage="Links per page"
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={resultsCount}
          rowsPerPage={rowsPerPage}
          page={currentPage}
          backIconButtonProps={{
            'aria-label': 'previous page',
          }}
          nextIconButtonProps={{
            'aria-label': 'next page',
          }}
          onChangePage={changePageHandler}
          onChangeRowsPerPage={changeRowsPerPageHandler}
          classes={{
            spacer: classes.spacer,
            toolbar: classes.toolbar,
            caption: classes.caption,
            select: classes.select,
            selectIcon: classes.selectIcon,
          }}
        />
      </TableCell>
    </TableRow>
  )
}

export default SearchTablePagination
