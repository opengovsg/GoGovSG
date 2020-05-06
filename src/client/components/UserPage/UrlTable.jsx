import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Table, TablePagination } from '@material-ui/core'
import debounce from 'lodash/debounce'
import isMatch from 'lodash/isMatch'
import 'boxicons'

import userActions from '../../actions/user'
import EnhancedTableHead from './EnhancedTableHead'
import EnhancedTableBody from './EnhancedTableBody'

const mapStateToProps = (state) => ({
  urlCount: state.user.urlCount,
  tableConfig: state.user.tableConfig,
})

const mapDispatchToProps = (dispatch) => {
  const debouncedUpdateSearchText = debounce(
    () => dispatch(userActions.getUrlsForUser()),
    500,
  )
  return {
    updateUrlTableConfig: (config) => {
      dispatch(userActions.setUrlTableConfig(config))
      dispatch(userActions.getUrlsForUser())
    },
    updateSearchText: (searchText) => {
      dispatch(userActions.setUrlTableConfig({ searchText, pageNumber: 0 }))
      debouncedUpdateSearchText()
    },
    openCreateUrlModal: () => {
      dispatch(userActions.openCreateUrlModal())
    },
  }
}

/**
 * Prevents re-render if pagination did not change.
 */
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

/**
 * Display URLs in a table.
 */
const UrlTable = ({ urlCount, tableConfig, updateUrlTableConfig }) => {
  return (
    <>
      <Table aria-label="table with urls">
        <EnhancedTableHead />
        <EnhancedTableBody />
      </Table>
      <MemoTablePagination
        urlCount={urlCount}
        tableConfig={tableConfig}
        updateUrlTableConfig={updateUrlTableConfig}
      />
    </>
  )
}

MemoTablePagination.propTypes = {
  urlCount: PropTypes.number.isRequired,
  tableConfig: PropTypes.shape({
    numberOfRows: PropTypes.number,
    pageNumber: PropTypes.number,
    sortDirection: PropTypes.oneOf(['asc', 'desc', 'none']),
    orderBy: PropTypes.oneOf([
      'createdAt',
      'shortUrl',
      'longUrl',
      'updatedAt',
      'clicks',
      'state',
    ]),
    searchText: PropTypes.string,
  }).isRequired,
  updateUrlTableConfig: PropTypes.func.isRequired,
}

UrlTable.propTypes = {
  urlCount: PropTypes.number.isRequired,
  tableConfig: PropTypes.shape({
    numberOfRows: PropTypes.number,
    pageNumber: PropTypes.number,
    sortDirection: PropTypes.oneOf(['asc', 'desc', 'none']),
    orderBy: PropTypes.oneOf([
      'createdAt',
      'shortUrl',
      'longUrl',
      'updatedAt',
      'clicks',
      'state',
    ]),
    searchText: PropTypes.string,
  }).isRequired,
  updateUrlTableConfig: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(UrlTable)
