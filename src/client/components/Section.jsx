import React from 'react'
import PropTypes from 'prop-types'
import { createStyles, makeStyles } from '@material-ui/core'
import { ApplyAppMargins } from './AppMargins'

const useStyles = makeStyles((theme) =>
  createStyles({
    backgroundType: {
      width: '100%',
      backgroundColor: (props) =>
        props.backgroundType === 'light'
          ? theme.palette.secondary.light
          : theme.palette.secondary.dark,
    },
    childrenPadding: {
      paddingTop: (props) =>
        theme.spacing(8 * props.verticalMultiplier * props.topMultiplier),
      paddingBottom: (props) =>
        theme.spacing(8 * props.verticalMultiplier * props.bottomMultiplier),
    },
  }),
)

const Section = ({
  children,
  backgroundType,
  verticalMultiplier = 1,
  topMultiplier = 1,
  bottomMultiplier = 1,
}) => {
  const classes = useStyles({
    backgroundType,
    verticalMultiplier,
    topMultiplier,
    bottomMultiplier,
  })
  return (
    <div className={classes.backgroundType}>
      <ApplyAppMargins>
        <div className={classes.childrenPadding}>{children}</div>
      </ApplyAppMargins>
    </div>
  )
}

Section.propTypes = {
  backgroundType: PropTypes.string,
  verticalMultiplier: PropTypes.number,
  topMultiplier: PropTypes.number,
  bottomMultiplier: PropTypes.number,
}

Section.defaultProps = {
  backgroundType: 'light',
  verticalMultiplier: 1,
  topMultiplier: 1,
  bottomMultiplier: 1,
}

export default Section
