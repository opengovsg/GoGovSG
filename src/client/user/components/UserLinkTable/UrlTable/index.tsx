import React from 'react'
import { Table, createStyles, makeStyles } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import EnhancedTableBody from './EnhancedTableBody/index.js'
import MemoTablePagination from './MemoTablePagination/index.js'
import userActions from '../../../actions/index.js'
import { GoGovReduxState } from '../../../../app/reducers/types.js'
import { UrlTableConfig } from '../../../reducers/types.js'

const useStyles = makeStyles((theme) =>
  createStyles({
    urlTable: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(4),
      minHeight: '500px',
    },
  }),
)

function UrlTable() {
  const classes = useStyles()
  const urlCount = useSelector((state: GoGovReduxState) => state.user.urlCount)
  const tableConfig = useSelector(
    (state: GoGovReduxState) => state.user.tableConfig,
  )
  const dispatch = useDispatch()
  const updateUrlTableConfig = (config: UrlTableConfig) => {
    dispatch(userActions.setUrlTableConfig(config))
    dispatch(userActions.getUrlsForUser())
  }

  return (
    <div className={classes.urlTable}>
      <Table aria-label="table with urls">
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

export default UrlTable
