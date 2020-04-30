import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  Button,
  IconButton,
  InputAdornment,
  Table,
  TablePagination,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core'

import { MuiThemeProvider, withStyles } from '@material-ui/core/styles'

import 'boxicons'

import debounce from 'lodash/debounce'
import isMatch from 'lodash/isMatch'
import userActions from '~/actions/user'
import { downloadUrls } from '~/util/download'

import EnhancedTableHead from './EnhancedTableHead'
import EnhancedTableBody from './EnhancedTableBody'

import urlTableTheme from '~/styles/tableTheme'
import userPageStyle from '~/styles/userPage'

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
 * Prevents re-render if search input did not change.
 */
// eslint-disable-next-line max-len
const searchInputIsEqual = (prev, next) =>
  prev.tableConfig.searchText === next.tableConfig.searchText

/**
 * Search Input field.
 */
const SearchInput = React.memo(({ classes, tableConfig, searchIfChanged }) => {
  const changeSearchTextHandler = (event) => {
    searchIfChanged(event.target.value)
  }
  const clearSearchTextHandler = () => {
    searchIfChanged('')
  }

  return (
    <TextField
      autoFocus
      className={classes.searchInput}
      value={tableConfig.searchText}
      onChange={changeSearchTextHandler}
      onBlur={changeSearchTextHandler}
      onKeyDown={(e) => {
        switch (e.key) {
          case 'Escape':
            e.target.value = ''
            clearSearchTextHandler()
            break
          case 'Enter':
            break
          default:
            return
        }
        e.target.blur()
        e.preventDefault()
      }}
      placeholder="Search…"
      inputProps={{ 'aria-label': 'search' }}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <box-icon name="search" />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end" onClick={clearSearchTextHandler}>
            <box-icon name="x" />
          </InputAdornment>
        ),
      }}
    />
  )
}, searchInputIsEqual)

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
const UrlTable = ({
  classes,
  urlCount,
  tableConfig,
  updateUrlTableConfig,
  updateSearchText,
  openCreateUrlModal,
}) => {
  const searchIfChanged = (text) => {
    if (tableConfig.searchText !== text) {
      updateSearchText(text)
    }
  }
  return (
    <MuiThemeProvider theme={urlTableTheme}>
      <div className={classes.table}>
        <Toolbar className={classes.toolbar}>
          <Typography
            variant="h1"
            align="left"
            className={classes.toolbarTitle}
            gutterBottom
          >
            Your Links
          </Typography>
          <div className={classes.toolbarActions}>
            <div>
              <IconButton
                variant="contained"
                size="small"
                onClick={() => downloadUrls(urlCount, tableConfig)}
              >
                <box-icon name="download" />
              </IconButton>
            </div>
            <SearchInput
              classes={classes}
              tableConfig={tableConfig}
              searchIfChanged={searchIfChanged}
            />
            <Button
              className={classes.createUrlBtn}
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                openCreateUrlModal()
              }}
            >
              Create link
            </Button>
          </div>
        </Toolbar>
        <Table aria-label="table with urls">
          <EnhancedTableHead />
          <EnhancedTableBody />
        </Table>
        <MemoTablePagination
          urlCount={urlCount}
          tableConfig={tableConfig}
          updateUrlTableConfig={updateUrlTableConfig}
        />
      </div>
    </MuiThemeProvider>
  )
}

SearchInput.propTypes = {
  classes: PropTypes.shape({}).isRequired,
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
  searchIfChanged: PropTypes.func.isRequired,
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
  classes: PropTypes.shape({}).isRequired,
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
  updateSearchText: PropTypes.func.isRequired,
  openCreateUrlModal: PropTypes.func.isRequired,
}

export default withStyles(userPageStyle)(
  connect(mapStateToProps, mapDispatchToProps)(UrlTable),
)
