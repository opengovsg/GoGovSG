import React from 'react'
import { TablePagination, createStyles, makeStyles } from '@material-ui/core'
import isMatch from 'lodash/isMatch'
import useAppMargins from '../../../../AppMargins/appMargins'
import PaginationActionComponent from './PaginationActionComponent'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'inline',
    },
    toolbar: {
      paddingLeft: 0,
      paddingRight: 0,
      width: '50%',
    },
    spacer: {
      flex: 0,
      paddingLeft: (props) => props.appMargins,
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
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    selectIcon: {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  }),
)

// Prevents re-render if pagination did not change.
const paginationInputIsEqual = (prev, next) =>
  prev.tableConfig.numberOfRows === next.tableConfig.numberOfRows &&
  prev.tableConfig.pageNumber === next.tableConfig.pageNumber &&
  prev.urlCount === next.urlCount

const MemoTablePagination = React.memo(
  ({ urlCount, tableConfig, updateUrlTableConfig }) => {
    const appMargins = useAppMargins()
    const classes = useStyles({ appMargins })

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
          root: classes.root,
          selectIcon: classes.selectIcon,
        }}
        labelDisplayedRows={() => {}}
      />
    )
  },
  paginationInputIsEqual,
)

export default MemoTablePagination
