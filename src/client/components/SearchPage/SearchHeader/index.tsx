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
import BetaTag from '../../widgets/BetaTag'

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
      margin: '0 auto',
      maxWidth: (props: SearchHeaderStyleProps) =>
        theme.spacing(180) - 2 * props.appMargins,
      [theme.breakpoints.up('md')]: {
        top: '35px',
      },
    },
    headerTextWrapper: {
      color: '#f9f9f9',
      marginBottom: theme.spacing(3),
      display: 'flex',
      alignItems: 'center',
    },
    headerText: {
      flexShrink: 0,
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        marginRight: theme.spacing(1),
      },
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
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <div className={classes.headerWrapper}>
      <ApplyAppMargins>
        <div className={classes.headerContent}>
          <div className={classes.headerTextWrapper}>
            <Typography
              variant={isMobileView ? 'h4' : 'h2'}
              className={classes.headerText}
            >
              Search go.gov.sg links
            </Typography>
            <BetaTag />
          </div>
          <GoSearchInput
            showAdornments
            onQueryChange={onQueryChange}
            query={query}
            onSortOrderChange={onSortOrderChange}
            sortOrder={sortOrder}
            onClearQuery={onClearQuery}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                (e.target as any).blur()
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
