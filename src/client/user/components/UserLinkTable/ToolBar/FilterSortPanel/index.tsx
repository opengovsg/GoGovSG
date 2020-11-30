import React, { FunctionComponent, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Grid } from '@material-ui/core'
import SortPanel from '../../../../../app/components/widgets/SortPanel'
import userActions from '../../../../actions'
import FilterPanel from './FilterPanel'
import FilterSortPanelFooter from './FilterSortPanelFooter'
import {
  SortDirection,
  UrlState,
  UrlTableConfig,
  UrlTableFilterConfig,
} from '../../../../reducers/types'
import { initialSortConfig } from '../../../../constants'
import CollapsingPanel from '../../../../../app/components/widgets/CollapsingPanel'
import useStyles from './styles'

type FilterSortPanelProps = {
  isOpen: boolean
  onClose: () => void
  tableConfig: UrlTableConfig
}

type updateSortAndFilterProps = {
  title: UrlTableConfig['orderBy']
  direction: UrlTableConfig['sortDirection']
  state: UrlTableFilterConfig['state'] | undefined
  isFile: UrlTableFilterConfig['isFile'] | undefined
}

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

const FilterSortPanel: FunctionComponent<FilterSortPanelProps> = ({
  isOpen,
  onClose,
  tableConfig,
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const updateSortAndFilter = ({
    title,
    direction,
    state,
    isFile,
  }: updateSortAndFilterProps) => {
    dispatch(
      userActions.setUrlTableConfig({
        orderBy: title,
        sortDirection: direction,
      } as UrlTableConfig),
    )
    dispatch(
      userActions.setUrlFilter({
        state,
        isFile,
      }),
    )
    dispatch(userActions.getUrlsForUser())
  }
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
    let isFile: UrlTableFilterConfig['isFile']
    let state: UrlTableFilterConfig['state']
    if (isIncludeLinks !== isIncludeFiles) {
      if (isIncludeLinks) {
        isFile = false
      } else {
        isFile = true
      }
    }
    if (isIncludeActive !== isIncludeInactive) {
      if (isIncludeActive) {
        state = UrlState.Active
      } else {
        state = UrlState.Inactive
      }
    }
    updateSortAndFilter({
      title: orderBy,
      direction: SortDirection.Descending,
      state,
      isFile,
    })
    onClose()
  }
  const reset = () => {
    setIsIncludeFiles(false)
    setIsIncludeLinks(false)
    setIsIncludeActive(false)
    setIsIncludeInactive(false)
    setOrderBy(initialSortConfig.orderBy)
    updateSortAndFilter({
      title: initialSortConfig.orderBy,
      direction: SortDirection.Descending,
      state: undefined,
      isFile: undefined,
    })
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

export default FilterSortPanel
