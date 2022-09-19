import React, { FunctionComponent } from 'react'
import {
  Collapse,
  Divider,
  Drawer,
  Grid,
  Paper,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import SortButton from '../widgets/SortPanel/SortButton'

type FilterDrawerProps = {
  labels: string[]
  selectedLabel: string
  onClick: (label: string) => void
  isFilterOpen: boolean
  isMobileView: boolean
  setIsFilterOpen: (isFilterOpen: boolean) => void
}

const useStyles = makeStyles((theme) =>
  createStyles({
    filterPanel: {
      padding: theme.spacing(1.5),
      [theme.breakpoints.up('md')]: {
        width: 300,
      },
    },
    headerText: {
      padding: theme.spacing(3.5),
    },
  }),
)

/**
 * @component Filter dropdown that filters the search by the given labels.
 */
const FilterDrawer: FunctionComponent<FilterDrawerProps> = ({
  labels,
  selectedLabel,
  onClick,
  isFilterOpen,
  isMobileView,
  setIsFilterOpen,
}: FilterDrawerProps) => {
  const classes = useStyles()

  const handleDrawerClose = () => {
    setIsFilterOpen(false)
  }

  return (
    <>
      {isMobileView ? (
        <Drawer
          anchor="bottom"
          open={isFilterOpen}
          onBackdropClick={handleDrawerClose}
          onEscapeKeyDown={handleDrawerClose}
        >
          <Collapse in={isFilterOpen}>
            <Paper className={classes.filterPanel}>
              <Typography variant="h4" className={classes.headerText}>
                Search by
              </Typography>
              <Divider />
              <Grid>
                {labels.map((label) => (
                  <SortButton
                    onClick={() => {
                      onClick(label)
                      setIsFilterOpen(false)
                    }}
                    key={label}
                    columnLabel={label}
                    isSelected={label === selectedLabel}
                  />
                ))}
              </Grid>
            </Paper>
          </Collapse>
        </Drawer>
      ) : (
        <Collapse in={isFilterOpen}>
          <Paper className={classes.filterPanel}>
            <Grid>
              {labels.map((label) => (
                <SortButton
                  onClick={() => {
                    onClick(label)
                    setIsFilterOpen(false)
                  }}
                  key={label}
                  columnLabel={`Search by ${label}`}
                  isSelected={label === selectedLabel}
                />
              ))}
            </Grid>
          </Paper>
        </Collapse>
      )}
    </>
  )
}

export default FilterDrawer
