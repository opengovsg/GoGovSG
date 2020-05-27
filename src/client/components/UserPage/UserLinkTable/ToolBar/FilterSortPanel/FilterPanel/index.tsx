import React from 'react'
import {
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

import FilterCheckbox from './FilterCheckbox'
import useStyles from '../styles'

export type FilterPanelProps = {
  isIncludeFiles: boolean
  isIncludeLinks: boolean
  isIncludeActive: boolean
  isIncludeInactive: boolean
  setIsIncludeFiles: (checked: boolean) => void
  setIsIncludeLinks: (checked: boolean) => void
  setIsIncludeActive: (checked: boolean) => void
  setIsIncludeInactive: (checked: boolean) => void
}

// Destination type filtering has been temporarily commented out.
// The filter should not be added until file upload is released.
export default ({
  // isIncludeFiles,
  // isIncludeLinks,
  isIncludeActive,
  isIncludeInactive,
  // setIsIncludeFiles,
  // setIsIncludeLinks,
  setIsIncludeActive,
  setIsIncludeInactive,
}: FilterPanelProps) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <Grid container item direction="column">
      <Grid item className={classes.filterHeaderGrid}>
        <Typography
          variant={isMobile ? 'h3' : 'caption'}
          className={classes.sectionHeader}
        >
          {isMobile ? 'Filter' : 'Filter by'}
        </Typography>
      </Grid>
      <Grid item className={classes.dividerGrid}>
        <Divider className={classes.divider} />
      </Grid>
      {/* <Grid
        item
        container
        direction="column"
        className={classes.filterSectionGrid}
      >
        <Grid item>
          <Typography variant="body2" className={classes.filterSectionHeader}>
            Destination Type
          </Typography>
        </Grid>
        <Grid container item alignItems="center">
          <FilterCheckbox
            checked={isIncludeLinks}
            className={classes.leftCheckbox}
            onClick={() => setIsIncludeLinks(!isIncludeLinks)}
          />
          <Typography variant="body2" className={classes.filterLabelLeft}>
            Link
          </Typography>
          <FilterCheckbox
            checked={isIncludeFiles}
            className={classes.leftCheckbox}
            onClick={() => setIsIncludeFiles(!isIncludeFiles)}
          />
          <Typography variant="body2" className={classes.filterLabelRight}>
            File
          </Typography>
        </Grid>
      </Grid> */}
      <Grid
        item
        container
        direction="column"
        className={classes.filterSectionGrid}
      >
        <Grid item>
          <Typography variant="body2" className={classes.filterSectionHeader}>
            Status
          </Typography>
        </Grid>
        <Grid container item alignItems="center">
          <FilterCheckbox
            checked={isIncludeActive}
            className={classes.leftCheckbox}
            onClick={() => setIsIncludeActive(!isIncludeActive)}
          />
          <Typography variant="body2" className={classes.filterLabelLeft}>
            Active
          </Typography>
          <FilterCheckbox
            checked={isIncludeInactive}
            className={classes.leftCheckbox}
            onClick={() => setIsIncludeInactive(!isIncludeInactive)}
          />
          <Typography variant="body2" className={classes.filterLabelRight}>
            Inactive
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}
