import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  TableCell, TableHead, TableRow, TableSortLabel,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import userActions from '~/actions/user'

import userPageStyle from '~/styles/userPage'

const mapStateToProps = state => ({
  tableConfig: state.user.tableConfig,
})

const mapDispatchToProps = dispatch => ({
  updateOrderAndDirection: (title, direction) => {
    dispatch(userActions.setUrlTableConfig(
      {
        orderBy: title,
        sortDirection: direction,
      }
    ))
    dispatch(userActions.getUrlsForUser())
  },
})

const EnhancedTableHead = ({ classes, updateOrderAndDirection, tableConfig }) => {
  const columnTitles = [
    {
      name: 'Owner', sortable: false, center: true, className: classes.leftCell,
    },
    { name: 'Original URL', sortable: true, center: false },
    { name: 'Short URL', sortable: true, center: false },
    { name: 'QR', sortable: false, center: false },
    { name: 'Last Modified', sortable: true, center: false },
    { name: 'Visits', sortable: true, center: false },
    { name: 'Status', sortable: true, center: false },
  ]

  const titleMap = {
    Owner: 'shortUrl',
    'Original URL': 'longUrl',
    'Short URL': 'shortUrl',
    QR: 'shortUrl',
    'Last Modified': 'updatedAt',
    Visits: 'clicks',
    Status: 'state',
  }

  /**
   * Updates the column and sort direction of the url table.
   * @param {string} columnTitle
   * @param {string} sortDirection
   */
  // eslint-disable-next-line
  const changeSortHandler = (columnTitle, sortDirection) => (event) => {
    const newOrder = sortDirection === 'desc' ? 'asc' : 'desc'
    updateOrderAndDirection(titleMap[columnTitle], newOrder)
  }

  return (
    <TableHead className={classes.tableHeadResponsive}>
      <TableRow>
        {columnTitles.map(title => (
          <TableCell
            className={title.className ? title.className : ''}
            key={title.name}
            align={title.center ? 'center' : 'left'}
          >
            {title.sortable ? (
              <TableSortLabel
                active={tableConfig.orderBy === title.name}
                direction={tableConfig.sortDirection}
                onClick={changeSortHandler(title.name, tableConfig.sortDirection)}
              >
                {title.name}
              </TableSortLabel>
            )
              : title.name
            }

          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  updateOrderAndDirection: PropTypes.func.isRequired,
  tableConfig: PropTypes.shape({
    numberOfRows: PropTypes.number,
    pageNumber: PropTypes.number,
    sortDirection: PropTypes.oneOf(['asc', 'desc', 'none']),
    orderBy: PropTypes.oneOf(['createdAt', 'shortUrl', 'longUrl', 'updatedAt', 'clicks', 'state']),
    searchText: PropTypes.string,
  }).isRequired,
  classes: PropTypes.shape({}).isRequired,
}

export default withStyles(userPageStyle)(
  connect(mapStateToProps, mapDispatchToProps)(EnhancedTableHead)
)
