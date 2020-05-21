import { useSelector } from 'react-redux'

export default function useIsFiltered() {
  const tableConfig = useSelector((state: any) => state.user.tableConfig)
  const searchText = tableConfig.searchText
  const filtered = Object.values(tableConfig.filter).some((value) => !!value)
  return !!searchText || filtered
}
