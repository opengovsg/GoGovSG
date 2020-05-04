import React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import emptyStateGraphic from '../../../assets/user-page-graphics/empty-state.svg'
import CreateButton from './CreateButton'

const useState = makeStyles((theme) =>
  createStyles({
    emptyStateContainer: {
      margin: 'auto',
      width: '180px',
      marginTop: theme.spacing(10),
      marginBottom: theme.spacing(10),
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(12),
        marginBottom: theme.spacing(12),
      },
    },
    headerText: {
      marginBottom: theme.spacing(4),
    },
    emptyStateGraphic: {
      display: 'block',
      margin: 'auto',
    },
    createButtonDiv: {
      display: 'flex',
      justifyContent: 'center',
    },
  }),
)

const EmptyState = () => {
  const classes = useState()
  return (
    <div className={classes.emptyStateContainer}>
      <Typography
        className={classes.headerText}
        align="center"
        variant="body2"
        color="textPrimary"
      >
        You have not created any short links yet.
      </Typography>
      <img
        className={classes.emptyStateGraphic}
        src={emptyStateGraphic}
        alt="No shortened links yet"
      />
      <div className={classes.createButtonDiv}>
        <CreateButton />
      </div>
    </div>
  )
}

export default EmptyState
