import React from 'react'
import { TablePagination } from '@material-ui/core'
import isMatch from 'lodash/isMatch'

// Prevents re-render if pagination did not change.
const paginationInputIsEqual = (prev, next) =>
  prev.tableConfig.numberOfRows === next.tableConfig.numberOfRows &&
  prev.tableConfig.pageNumber === next.tableConfig.pageNumber &&
  prev.urlCount === next.urlCount

const MemoTablePagination = React.memo(
  ({ urlCount, tableConfig, updateUrlTableConfig }) => {
    const updateTableIfChanged = (newConfig) => {
      if (!isMatch(tableConfig, newConfig)) {
        updateUrlTableConfig(newConfig)
      }
    }
    const changePageHandler = (_, pageNumber) => {
      updateTableIfChanged({ pageNumber })
    }
    const changeRowsPerPageHandler = (event) => {
      updateTableIfChanged({ numberOfRows: event.target.value, pageNumber: 0 })
    }

    return (
      <TablePagination
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
      />
    )
  },
  paginationInputIsEqual,
)

export default MemoTablePagination
