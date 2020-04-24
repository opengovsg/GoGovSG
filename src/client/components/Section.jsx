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
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
    },
  }),
)

const Section = ({ children, backgroundType, isSliver }) => {
  const classes = useStyles()
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
  const childrenPadding = isSliver ? classes.childrenPadding : ''
  return (
    <div className={getBackgroundType()}>
      <ApplyAppMargins>
        <div className={childrenPadding}>{children}</div>
      </ApplyAppMargins>
    </div>
  )
}

Section.propTypes = {
  backgroundType: PropTypes.string,
  isSliver: PropTypes.bool,
}

Section.defaultProps = {
  backgroundType: 'light',
  isSliver: true,
}

export default Section
