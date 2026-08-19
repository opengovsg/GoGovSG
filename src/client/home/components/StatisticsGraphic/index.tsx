import React from 'react'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import statsGraphic from '@assets/components/home/statistics-graphic/stats-graphic.svg'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      maxWidth: '100%',
    },
  }),
)

function StatisticsGraphic() {
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
