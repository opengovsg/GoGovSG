import React from 'react'
import {
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import useStyles from '../../UserPage/UserLinkTable/ToolBar/FilterSortPanel/styles'
import SortButton from './SortButton'

export type SortPanelProps = {
  onChoose: (orderBy: string) => void
  currentlyChosen: string
  options: Array<{ key: string; label: string }>
  noHeader?: boolean
}

export default React.memo(
  ({ onChoose, currentlyChosen, options, noHeader }: SortPanelProps) => {
    const classes = useStyles()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    return (
      <Grid container item direction="column">
        {!noHeader && (
          <>
            <Grid item className={classes.sortHeaderGrid}>
              <Typography
                variant={isMobile ? 'h3' : 'caption'}
                className={classes.sectionHeader}
              >
                {isMobile ? 'Sort' : 'Sort by'}
              </Typography>
            </Grid>
            <Grid item className={classes.dividerGrid}>
              <Divider className={classes.divider} />
            </Grid>
          </>
        )}
        {options.map((option) => (
          <Grid item className={classes.sortButtonGrid}>
            <SortButton
              onClick={() => onChoose(option.key)}
              columnLabel={option.label}
              isSelected={currentlyChosen === option.key}
            />
          </Grid>
        ))}
      </Grid>
    )
  },
)
