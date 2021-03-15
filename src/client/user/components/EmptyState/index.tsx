import React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import emptyStateGraphic from '@assets/components/user/empty-state/empty-state.svg'
import CreateButton from './CreateButton'

const useState = makeStyles((theme) =>
  createStyles({
    emptyStateContainer: {
      width: 234,
      margin: 'auto',
      marginTop: (props: EmptyStateProps) => (!props.urlsFiltered ? 45 : 26),
      marginBottom: 78,
      [theme.breakpoints.up('md')]: {
        width: 'unset',
        marginTop: (props: EmptyStateProps) => (!props.urlsFiltered ? 85 : 45),
        marginBottom: (props: EmptyStateProps) =>
          !props.urlsFiltered ? 85 : 45,
      },
    },
    headerText: {
      lineHeight: '25px',
      marginBottom: 0,
      fontWeight: 400,
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

const EmptyState = ({ urlsFiltered }: EmptyStateProps) => {
  const classes = useState({ urlsFiltered })
  return (
    <div className={classes.emptyStateContainer}>
      <div>
        {urlsFiltered && (
          <Typography
            className={classes.headerText}
            align="center"
            variant="body2"
            color="textPrimary"
          >
            No results found, try expanding your search terms.
          </Typography>
        )}
        {!urlsFiltered && (
          <Typography
            className={classes.headerText}
            align="center"
            variant="body2"
            color="textPrimary"
          >
            You do not have any short links yet.
          </Typography>
        )}
        {!urlsFiltered && (
          <Typography
            className={classes.headerText}
            align="center"
            variant="body2"
            color="textPrimary"
          >
            Get started and customise one from an existing link or file!
          </Typography>
        )}
      </div>
      <img
        className={classes.emptyStateGraphic}
        src={emptyStateGraphic}
        alt="No shortened links yet"
        draggable={false}
      />
      {!urlsFiltered && (
        <div className={classes.createButtonDiv}>
          <CreateButton />
        </div>
      )}
    </div>
  )
}

export default EmptyState
