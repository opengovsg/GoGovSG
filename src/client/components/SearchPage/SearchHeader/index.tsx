import React, { FunctionComponent } from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import { ApplyAppMargins } from '../../AppMargins'
import GoSearchInput from '../../widgets/GoSearchInput'
import { SearchResultsSortOrder } from '../../../../shared/search'
import useAppMargins from '../../AppMargins/appMargins'

type SearchHeaderProps = {
  onQueryChange: (query: string) => void
  onSortOrderChange: (order: SearchResultsSortOrder) => void
  onClearQuery: () => void
  sortOrder: SearchResultsSortOrder
  query: string
}

type SearchHeaderStyleProps = {
  appMargins: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    headerWrapper: {
      backgroundColor: '#384a51',
      position: 'sticky',
      top: 0,
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      top: '22px',
      maxWidth: (props: SearchHeaderStyleProps) =>
        `calc(${theme.spacing(180)}px - ${props.appMargins}px)`,
      [theme.breakpoints.up('md')]: {
        top: '35px',
      },
    },
    headerText: {
      color: '#f9f9f9',
      marginBottom: theme.spacing(3),
    },
  }),
)

const SearchHeader: FunctionComponent<SearchHeaderProps> = ({
  onQueryChange,
  onSortOrderChange,
  onClearQuery,
  sortOrder,
  query,
}: SearchHeaderProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  return (
    <div className={classes.headerWrapper}>
      <ApplyAppMargins>
        <div className={classes.headerContent}>
          <Typography variant="h2" className={classes.headerText}>
            GoSearch
          </Typography>
          <GoSearchInput
            showAdornments
            onQueryChange={onQueryChange}
            query={query}
            onSortOrderChange={onSortOrderChange}
            sortOrder={sortOrder}
            onClearQuery={onClearQuery}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                ;(e.target as any).blur()
                e.preventDefault()
              }
            }}
          />
        </div>
      </ApplyAppMargins>
    </div>
  )
}

export default SearchHeader
