import React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import emptyStateGraphic from '../../../assets/user-page-graphics/empty-state.svg'
import CreateButton from './CreateButton'

const useState = makeStyles((theme) =>
  createStyles({
    emptyStateContainer: {
      margin: 'auto',
      marginTop: (props: EmptyStateProps) => (!props.urlsFiltered ? 45 : 26),
      marginBottom: (props: EmptyStateProps) => (!props.urlsFiltered ? 45 : 26),
      [theme.breakpoints.up('md')]: {
        marginTop: (props: EmptyStateProps) => (!props.urlsFiltered ? 85 : 45),
        marginBottom: (props: EmptyStateProps) =>
          !props.urlsFiltered ? 85 : 45,
      },
    },
    headerText: {
      lineHeight: '25px',
      marginBottom: 0,
      '&:last-child': {
        marginBottom: 21,
      },
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

type EmptyStateProps = {
  urlsFiltered: boolean
}

const EmptyState = (props: EmptyStateProps) => {
  const classes = useState(props)
  return (
    <div className={classes.emptyStateContainer}>
      <div>
        {props.urlsFiltered && (
          <Typography
            className={classes.headerText}
            align="center"
            variant="body1"
            color="textPrimary"
          >
            {'No results found, try expanding your search terms.'}
          </Typography>
        )}
        {!props.urlsFiltered && (
          <Typography
            className={classes.headerText}
            align="center"
            variant="body1"
            color="textPrimary"
          >
            {'You do not have any short links yet.'}
          </Typography>
        )}
        {!props.urlsFiltered && (
          <Typography
            className={classes.headerText}
            align="center"
            variant="body1"
            color="textPrimary"
          >
            {'Get started and customise one from an existing link or file!'}
          </Typography>
        )}
      </div>
      <img
        className={classes.emptyStateGraphic}
        src={emptyStateGraphic}
        alt="No shortened links yet"
        draggable={false}
      />
      {!props.urlsFiltered && (
        <div className={classes.createButtonDiv}>
          <CreateButton />
        </div>
      )}
    </div>
  )
}

export default EmptyState
