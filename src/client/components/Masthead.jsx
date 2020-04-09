import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import mastheadStyle from '~/styles/masthead'

const Masthead = ({
  classes,
}) => (
  <div className={classes.masthead}>
    <a href="https://www.gov.sg" target="_blank" rel="noopener noreferrer" className={classes.mastheadLink}>
      <span className={classes.mastheadIcon} />
      <span className={classes.mastheadText}>A Singapore Government Agency Website</span>
    </a>
  </div>
)

export default withStyles(mastheadStyle)(Masthead)
