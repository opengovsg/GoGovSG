import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import statsGraphic from '../../../app/assets/landing-page-graphics/stats-graphic.svg'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      maxWidth: '100%',
    },
  }),
)

const StatisticsGraphic = () => {
  const classes = useStyles()

  return (
    <img
      className={classes.root}
      src={statsGraphic}
      alt="Statistics graphic"
      draggable={false}
    />
  )
}

export default StatisticsGraphic
