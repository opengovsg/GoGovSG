import React, { FunctionComponent } from 'react'
import {
  Typography,
  createStyles,
  makeStyles,
  useTheme,
  useMediaQuery,
} from '@material-ui/core'
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
  const classes = useStyles(appMargins)
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <div className={classes.headerWrapper}>
      <ApplyAppMargins>
        <div className={classes.headerContent}>
          <Typography
            variant={isMobileView ? 'h4' : 'h2'}
            className={classes.headerText}
          >
            Search go.gov.sg links
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
