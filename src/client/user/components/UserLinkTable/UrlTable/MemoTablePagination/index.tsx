import React from 'react'
import { TablePagination } from '@material-ui/core'
import isMatch from 'lodash/isMatch'
import useAppMargins from '../../../../../app/components/AppMargins/appMargins'
import PaginationActionComponent from '../../../../../app/components/widgets/PaginationActionComponent'
import useStyles from './styles'
import { UrlTableConfig } from '../../../../reducers/types'

type paginationInputIsEqualProps = {
  tableConfig: UrlTableConfig
  urlCount: number
}
// Prevents re-render if pagination did not change.
const paginationInputIsEqual = (
  prev: paginationInputIsEqualProps,
  next: paginationInputIsEqualProps,
) =>
  prev.tableConfig.numberOfRows === next.tableConfig.numberOfRows &&
  prev.tableConfig.pageNumber === next.tableConfig.pageNumber &&
  prev.urlCount === next.urlCount

type MemoTablePaginationProps = {
  urlCount: number
  tableConfig: UrlTableConfig
  updateUrlTableConfig: (config: UrlTableConfig) => void
}

const MemoTablePagination = React.memo(
  ({
    urlCount,
    tableConfig,
    updateUrlTableConfig,
  }: MemoTablePaginationProps) => {
    const appMargins = useAppMargins()
    const classes = useStyles({ appMargins })

    const updateTableIfChanged = (newConfig: Partial<UrlTableConfig>) => {
      if (!isMatch(tableConfig, newConfig)) {
        updateUrlTableConfig(newConfig as UrlTableConfig)
      }
    }
    const changePageHandler = (
      _: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
      pageNumber: number,
    ) => {
      updateTableIfChanged({ pageNumber })
    }
    const changeRowsPerPageHandler = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      updateTableIfChanged({
        numberOfRows: Number(event.target.value),
        pageNumber: 0,
      })
    }

    const pageCount = Math.ceil(urlCount / tableConfig.numberOfRows)

    return (
      <TablePagination
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
        count={urlCount}
        rowsPerPage={tableConfig.numberOfRows}
        page={tableConfig.pageNumber}
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
    )
  },
  paginationInputIsEqual,
)

export default MemoTablePagination
