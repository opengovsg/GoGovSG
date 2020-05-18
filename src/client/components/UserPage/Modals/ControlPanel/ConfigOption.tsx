import * as React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() =>
  createStyles({
    mainContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
    },
    leadingContainer: {
      flex: 1,
      marginRight: 19,
    },
    trailingContainer: {},
  }),
)

type ConfigOptionProps = {
  title: string
  subtitle?: string
  leading?: React.ReactNode
  trailing: React.ReactNode
}

// Represents an edit option on the ControlPanel.
export default function ConfigOption(props: ConfigOptionProps) {
  const classes = useStyles()
  return (
    <main className={classes.mainContainer}>
      <section className={classes.leadingContainer}>
        <Typography variant="h6">{props.title}</Typography>
        {props.subtitle && (
          <Typography variant="body1" color="textSecondary">
            {props.subtitle}
          </Typography>
        )}
        {props.leading}
      </section>
      <section className={classes.trailingContainer}>{props.trailing}</section>
    </main>
  )
}
