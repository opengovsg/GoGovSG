import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      minWidth: '100%',
      display: 'grid',
    },
    ignoreAppMargins: {
      gridRow: 1,
      gridColumn: 1,
      marginLeft: theme.spacing(-4),
      marginRight: theme.spacing(-4),
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(-6),
        marginRight: theme.spacing(-6),
      },
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(-8),
        marginRight: theme.spacing(-8),
      },
      [theme.breakpoints.up('lg')]: {
        marginLeft: theme.spacing(-12),
        marginRight: theme.spacing(-12),
      },
    },
    backgroundLight: {
      backgroundColor: theme.palette.secondary.light,
    },
    backgroundDark: {
      backgroundColor: theme.palette.secondary.dark,
    },
    backgroundPrimaryDark: {
      backgroundColor: theme.palette.primary.dark,
    },
    children: {
      gridRow: 1,
      gridColumn: 1,
    },
    childrenPadding: {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
    },
  }),
)

const SectionBackground = ({
  children,
  backgroundType,
  isSliver,
  ignoreAppMargins,
}) => {
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
  const negativeMargins = ignoreAppMargins ? classes.ignoreAppMargins : ''
  const backgroundColor = getBackgroundType()
  const childrenPadding = isSliver ? classes.childrenPadding : ''
  return (
    <section className={classes.container}>
      <span
        className={classNames(negativeMargins, backgroundColor)}
        style={{ backgroundColor }}
      />
      <span className={classNames(classes.children, childrenPadding)}>
        {children}
      </span>
    </section>
  )
}

SectionBackground.propTypes = {
  backgroundType: PropTypes.string,
  isSliver: PropTypes.bool,
  ignoreAppMargins: PropTypes.bool,
}

SectionBackground.defaultProps = {
  backgroundType: 'light',
  isSliver: true,
  ignoreAppMargins: true,
}

export default SectionBackground
