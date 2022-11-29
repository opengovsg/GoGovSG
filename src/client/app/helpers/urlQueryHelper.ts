import { UrlTableConfig } from '../../user/reducers/types'

const queryObjFromTableConfig = (tableConfig: UrlTableConfig) => {
  const {
    numberOfRows,
    pageNumber,
    sortDirection,
    orderBy,
    searchText,
    tags,
    filter: { state: urlState, isFile },
  } = tableConfig
  const offset = pageNumber * numberOfRows

  const queryObj = {
    limit: numberOfRows,
    offset,
    orderBy,
    sortDirection,
    ...(urlState && { state: urlState }),
    isFile,
    searchText,
    tags,
  }
  return queryObj
}

export default queryObjFromTableConfig
