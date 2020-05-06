import React from 'react'
import { Table, createStyles, makeStyles } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'

import EnhancedTableHead from './EnhancedTableHead'
import EnhancedTableBody from './EnhancedTableBody'
import MemoTablePagination from './MemoTablePagination'
import userActions from '../../../../actions/user'

const useStyles = makeStyles((theme) =>
  createStyles({
    urlTable: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(4),
    },
  }),
)

export default function UrlTable() {
  const classes = useStyles()
  const urlCount = useSelector((state) => state.user.urlCount)
  const tableConfig = useSelector((state) => state.user.tableConfig)
  const dispatch = useDispatch()
  const updateUrlTableConfig = (config) => {
    dispatch(userActions.setUrlTableConfig(config))
    dispatch(userActions.getUrlsForUser())
  }

  return (
    <div className={classes.urlTable}>
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
  )
}
