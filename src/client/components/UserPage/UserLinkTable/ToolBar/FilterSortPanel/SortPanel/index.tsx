import React from 'react'
import {
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import useStyles from '../styles'
import SortButton from './SortButton'

export type SortPanelProps = {
  onChoose: (orderBy: string) => void
  currentlyChosen: string
}

export default ({ onChoose, currentlyChosen }: SortPanelProps) => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Grid container item direction="column">
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
      <Grid item className={classes.sortButtonGrid}>
        <SortButton
          onClick={() => onChoose('createdAt')}
          columnLabel="Date of creation"
          isSelected={currentlyChosen === 'createdAt'}
        />
      </Grid>
      <Grid item className={classes.sortButtonGrid}>
        <SortButton
          onClick={() => onChoose('clicks')}
          columnLabel="Most number of visits"
          isSelected={currentlyChosen === 'clicks'}
        />
      </Grid>
    </Grid>
  )
}
