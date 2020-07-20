import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Grid } from '@material-ui/core'
import SortPanel from '../../../../widgets/SortPanel'
import userActions from '../../../../../actions/user'
import FilterPanel from './FilterPanel'
import FilterSortPanelFooter from './FilterSortPanelFooter'
import { SortDirection } from '../../../../../reducers/user/types'
import { initialSortConfig } from '../../../../../constants/user'
import CollapsingPanel from '../../../../widgets/CollapsingPanel'
import useStyles from './styles'

const mapDispatchToProps = (dispatch) => ({
  updateSortAndFilter: (title, direction, state, isFile) => {
    dispatch(
      userActions.setUrlTableConfig({
        orderBy: title,
        sortDirection: direction,
      }),
    )
    dispatch(
      userActions.setUrlFilter({
        state,
        isFile,
      }),
    )
    dispatch(userActions.getUrlsForUser())
  },
})

const sortOptions = [
  {
    label: 'Most number of visits',
    key: 'clicks',
  },
  {
    label: 'Date of creation',
    key: 'createdAt',
  },
]

const FilterSortPanel = ({
  isOpen,
  onClose,
  tableConfig,
  updateSortAndFilter,
}) => {
  const classes = useStyles()
  const [orderBy, setOrderBy] = useState(tableConfig.orderBy)
  const [isIncludeFiles, setIsIncludeFiles] = useState(
    tableConfig.filter.isFile === true,
  )
  const [isIncludeLinks, setIsIncludeLinks] = useState(
    tableConfig.filter.isFile === false,
  )
  const [isIncludeActive, setIsIncludeActive] = useState(
    tableConfig.filter.state === 'ACTIVE',
  )
  const [isIncludeInactive, setIsIncludeInactive] = useState(
    tableConfig.filter.state === 'INACTIVE',
  )
  const filterConfig = {
    isIncludeFiles,
    isIncludeLinks,
    isIncludeActive,
    isIncludeInactive,
    setIsIncludeFiles,
    setIsIncludeLinks,
    setIsIncludeActive,
    setIsIncludeInactive,
  }
  const changeSortAndFilterHandler = () => {
    let isFile
    let state
    if (isIncludeLinks !== isIncludeFiles) {
      if (isIncludeLinks) {
        isFile = false
      } else {
        isFile = true
      }
    }
    if (isIncludeActive !== isIncludeInactive) {
      if (isIncludeActive) {
        state = 'ACTIVE'
      } else {
        state = 'INACTIVE'
      }
    }
    updateSortAndFilter(orderBy, SortDirection.Descending, state, isFile)
    onClose()
  }
  const reset = () => {
    setIsIncludeFiles(false)
    setIsIncludeLinks(false)
    setIsIncludeActive(false)
    setIsIncludeInactive(false)
    setOrderBy(initialSortConfig.orderBy)
    updateSortAndFilter(
      initialSortConfig.orderBy,
      SortDirection.Descending,
      undefined,
      undefined,
    )
    onClose()
  }

  return (
    <CollapsingPanel
      isOpen={isOpen}
      onClose={onClose}
      className={classes.collapsingPanel}
    >
      <Grid
        container
        style={{
          paddingTop: '32px',
          paddingBottom: '48px',
        }}
      >
        <SortPanel
          onChoose={setOrderBy}
          currentlyChosen={orderBy}
          options={sortOptions}
        />
        <FilterPanel {...filterConfig} />
        <FilterSortPanelFooter
          onApply={changeSortAndFilterHandler}
          onReset={reset}
        />
      </Grid>
    </CollapsingPanel>
  )
}

export default connect(null, mapDispatchToProps)(FilterSortPanel)
