import React, { FunctionComponent, useEffect, useState } from 'react'
import {
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import useAppMargins from '../../../../../app/components/AppMargins/appMargins'
import BottomDrawer from '../../../../../app/components/widgets/BottomDrawer'
import SortPanel from '../../../../../app/components/widgets/SortPanel'
import { SearchResultsSortOrder } from '../../../../../../shared/search'
import FilterPanel from './FilterPanel'
import FilterSortPanelFooter from './FilterSortPanelFooter'
import CollapsingPanel from '../../../../../app/components/widgets/CollapsingPanel'
import { defaultSortOption } from '../../../../constants'

type SortDrawerProps = {
  open: boolean
  onClose: () => void
  options: Array<{ key: string; label: string }>
  onChoose: (orderBy: SearchResultsSortOrder) => void
  getFile: (queryFile: string) => void
  getState: (queryState: string) => void
  onApply: () => void
  onReset: () => void
}

const useStyles = makeStyles((theme) =>
  createStyles({
    titleText: {
      fontSize: '0.8125rem',
      fontWeight: 500,
      paddingLeft: theme.spacing(4),
      [theme.breakpoints.up('md')]: {
        color: '#767676',
      },
      [theme.breakpoints.down('sm')]: {
        paddingTop: theme.spacing(2),
      },
    },
    divider: {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(0.5),
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(3.5),
      marginBottom: theme.spacing(3.5),
      zIndex: 3,
    },
    sortPanel: {
      width: theme.spacing(50),
      right: 0,
      left: 'auto',
    },
  }),
)

/**
 * @component Holds the panel for sorting configuration and filter configuration based on state and type.
 */
const SortDrawer: FunctionComponent<SortDrawerProps> = ({
  open,
  onClose,
  options,
  onChoose,
  getFile,
  getState,
  onApply,
  onReset,
}: SortDrawerProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [orderBy, setOrderBy] = useState(defaultSortOption as string)
  const [isIncludeFiles, setIsIncludeFiles] = useState(false)

  const [isIncludeLinks, setIsIncludeLinks] = useState(false)

  const [isIncludeActive, setIsIncludeActive] = useState(false)

  const [isIncludeInactive, setIsIncludeInactive] = useState(false)

  // Order check
  useEffect(() => {
    onChoose(orderBy as SearchResultsSortOrder)
  }, [orderBy])

  // File check
  useEffect(() => {
    if (isIncludeFiles === isIncludeLinks) {
      getFile('')
    } else if (isIncludeFiles) {
      getFile('true')
    } else {
      getFile('false')
    }
  }, [isIncludeFiles, isIncludeLinks])

  // State check
  useEffect(() => {
    if (isIncludeActive === isIncludeInactive) {
      getState('')
    } else if (isIncludeActive) {
      getState('ACTIVE')
    } else {
      getState('INACTIVE')
    }
  }, [isIncludeActive, isIncludeInactive])

  // Close the modal and hit endpoint
  const applyChange = () => {
    onClose()
    onApply()
  }

  const reset = () => {
    // reset current component's state
    setOrderBy(defaultSortOption as string)
    setIsIncludeFiles(false)
    setIsIncludeLinks(false)
    setIsIncludeActive(false)
    setIsIncludeInactive(false)
    // reset to initial config
    onClose()
    onReset()
  }

  return (
    <>
      {isMobile ? (
        <BottomDrawer open={open} onClose={onClose}>
          <div className={classes.content}>
            <SortPanel
              onChoose={setOrderBy}
              currentlyChosen={orderBy}
              options={options}
            />
            <FilterPanel
              isIncludeFiles={isIncludeFiles}
              isIncludeLinks={isIncludeLinks}
              isIncludeActive={isIncludeActive}
              isIncludeInactive={isIncludeInactive}
              setIsIncludeFiles={setIsIncludeFiles}
              setIsIncludeLinks={setIsIncludeLinks}
              setIsIncludeActive={setIsIncludeActive}
              setIsIncludeInactive={setIsIncludeInactive}
            />
            <FilterSortPanelFooter onApply={applyChange} onReset={reset} />
          </div>
        </BottomDrawer>
      ) : (
        <CollapsingPanel isOpen={open} className={classes.sortPanel}>
          <div className={classes.content}>
            <SortPanel
              onChoose={setOrderBy}
              currentlyChosen={orderBy}
              options={options}
            />
            <FilterPanel
              isIncludeFiles={isIncludeFiles}
              isIncludeLinks={isIncludeLinks}
              isIncludeActive={isIncludeActive}
              isIncludeInactive={isIncludeInactive}
              setIsIncludeFiles={setIsIncludeFiles}
              setIsIncludeLinks={setIsIncludeLinks}
              setIsIncludeActive={setIsIncludeActive}
              setIsIncludeInactive={setIsIncludeInactive}
            />
            <FilterSortPanelFooter onApply={applyChange} onReset={reset} />
          </div>
        </CollapsingPanel>
      )}
    </>
  )
}

export default SortDrawer
