import React, { FunctionComponent } from 'react'
import {
  Button,
  Hidden,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import { ApplyAppMargins } from '../../../app/components/AppMargins'
import GoDirectoryInput from './DirectoryInput'
import { SearchResultsSortOrder } from '../../../../shared/search'
import useAppMargins from '../../../app/components/AppMargins/appMargins'
import BetaTag from '../../../app/components/widgets/BetaTag'
import arrow from '../../assets/arrow.svg'

type DirectoryHeaderProps = {
  onQueryChange: (query: string) => void
  onSortOrderChange: (order: SearchResultsSortOrder) => void
  onClearQuery: () => void
  query: string
  getFile: (queryFile: string) => void
  getState: (queryState: string) => void
  getEmail: (queryEmail: string) => void
  setDisablePagination: (disablePagination: boolean) => void
  onApply: () => void
  onReset: () => void
}

type DirectoryHeaderStyleProps = {
  appMargins: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    headerWrapper: {
      backgroundColor: '#384a51',
      position: 'sticky',
      top: 0,
    },
    headerWrapperShort: {
      backgroundColor: '#384a51',
      top: 0,
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      top: '22px',
      margin: '0 auto',
      maxWidth: (props: DirectoryHeaderStyleProps) =>
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
      justifyContent: 'space-between',
    },
    headerText: {
      flexShrink: 0,
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        marginRight: theme.spacing(1),
      },
    },
    leftWrapper: {
      display: 'flex',
      alignItems: 'center',
    },
    rightWrapper: {
      display: 'inline-flex',
    },
    arrow: {
      paddingRight: '5px',
    },
  }),
)

/**
 * @component Header bar that holds the search input bar and user page redirection button.
 */
const DirectoryHeader: FunctionComponent<DirectoryHeaderProps> = ({
  onQueryChange,
  onSortOrderChange,
  onClearQuery,
  query,
  getFile,
  getState,
  getEmail,
  onApply,
  onReset,
  setDisablePagination,
}: DirectoryHeaderProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  // smaller then 730px height will cause the filter modal to be inaccessible
  const isIdealHeight = useMediaQuery('(min-height: 730px)')

  return (
    <div
      className={
        isIdealHeight ? classes.headerWrapper : classes.headerWrapperShort
      }
    >
      <ApplyAppMargins>
        <div className={classes.headerContent}>
          <div className={classes.headerTextWrapper}>
            <div className={classes.leftWrapper}>
              <Typography
                variant={isMobileView ? 'h4' : 'h2'}
                className={classes.headerText}
              >
                Search directory
              </Typography>
              <BetaTag />
            </div>

            <Hidden xsDown>
              <div className={classes.rightWrapper}>
                <Button
                  href="/#/user"
                  size="large"
                  variant="text"
                  color="inherit"
                >
                  <img
                    className={classes.arrow}
                    src={arrow}
                    alt="arrow graphic"
                  />
                  Back to Dashboard
                </Button>
              </div>
            </Hidden>
          </div>
          <GoDirectoryInput
            showAdornments
            onQueryChange={onQueryChange}
            query={query}
            onSortOrderChange={onSortOrderChange}
            onClearQuery={onClearQuery}
            getFile={getFile}
            getState={getState}
            getEmail={getEmail}
            onApply={onApply}
            onReset={onReset}
            setDisablePagination={setDisablePagination}
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

export default DirectoryHeader
