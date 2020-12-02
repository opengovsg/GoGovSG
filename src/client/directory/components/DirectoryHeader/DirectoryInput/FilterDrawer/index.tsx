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
import SortButton from '../../../../../app/components/widgets/SortPanel/SortButton'

type FilterDrawerProps = {
  onClick: (email: boolean) => void
  selected: boolean
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

// Filter the search by keyword or email
const FilterDrawer: FunctionComponent<FilterDrawerProps> = ({
  onClick,
  selected,
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
                <SortButton
                  onClick={() => {
                    onClick(false)
                    setIsFilterOpen(false)
                  }}
                  columnLabel="Keyword"
                  isSelected={!selected}
                />
                <SortButton
                  onClick={() => {
                    onClick(true)
                    setIsFilterOpen(false)
                  }}
                  columnLabel="Email"
                  isSelected={selected}
                />
              </Grid>
            </Paper>
          </Collapse>
        </Drawer>
      ) : (
        <Collapse in={isFilterOpen}>
          <Paper className={classes.filterPanel}>
            <Grid>
              <SortButton
                onClick={() => {
                  onClick(false)
                  setIsFilterOpen(false)
                }}
                columnLabel="Search by Keyword"
                isSelected={!selected}
              />
              <SortButton
                onClick={() => {
                  onClick(true)
                  setIsFilterOpen(false)
                }}
                columnLabel="Search by Email"
                isSelected={selected}
              />
            </Grid>
          </Paper>
        </Collapse>
      )}
    </>
  )
}

export default FilterDrawer
