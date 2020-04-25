import React from 'react'
import PropTypes from 'prop-types'
import { createStyles, makeStyles } from '@material-ui/core'
import { ApplyAppMargins } from './AppMargins'

const useStyles = makeStyles((theme) =>
  createStyles({
    backgroundLight: {
      width: '100%',
      backgroundColor: theme.palette.secondary.light,
    },
    backgroundDark: {
      width: '100%',
      backgroundColor: theme.palette.secondary.dark,
    },
    backgroundPrimaryDark: {
      width: '100%',
      backgroundColor: theme.palette.primary.dark,
    },
    childrenPadding: {
      paddingTop: (props) => theme.spacing(8 * props.verticalMultiplier),
      paddingBottom: (props) => theme.spacing(8 * props.verticalMultiplier),
    },
  }),
)

const Section = ({ children, backgroundType, verticalMultiplier = 1 }) => {
  const classes = useStyles({ verticalMultiplier })
  const getBackgroundType = () => {
    switch (backgroundType) {
      case 'light':
        return classes.backgroundLight
      case 'dark':
        return classes.backgroundDark
      case 'primaryDark':
        return classes.backgroundPrimaryDark
      default:
        return classes.backgroundLight
    }
  }
  return (
    <div className={getBackgroundType()}>
      <ApplyAppMargins>
        <div className={classes.childrenPadding}>{children}</div>
      </ApplyAppMargins>
    </div>
  )
}

Section.propTypes = {
  backgroundType: PropTypes.string,
  verticalMultiplier: PropTypes.number,
}

Section.defaultProps = {
  backgroundType: 'light',
  verticalMultiplier: 1,
}

export default Section
