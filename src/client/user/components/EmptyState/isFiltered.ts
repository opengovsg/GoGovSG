import { useSelector } from 'react-redux'
import { GoGovReduxState } from '../../../app/reducers/types'

export default function useIsFiltered() {
  const tableConfig = useSelector(
    (state: GoGovReduxState) => state.user.tableConfig,
  )
  const { searchText } = tableConfig
  const filtered = Object.values(tableConfig.filter).some((value) => !!value)
  return !!searchText || filtered
}
