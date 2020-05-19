import * as React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'

type StylesProps = {
  trailingPosition: TrailingPosition
}

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
    trailingContainer: {
      marginTop: (props: StylesProps) =>
        props.trailingPosition == TrailingPosition.end ? 'auto' : 'unset',
      marginBottom: (props: StylesProps) =>
        props.trailingPosition == TrailingPosition.start ? 'auto' : 'unset',
    },
  }),
)

export enum TrailingPosition {
  start,
  center,
  end,
}

type ConfigOptionProps = {
  title: string
  subtitle?: string
  leading?: React.ReactNode
  trailing: React.ReactNode
  trailingPosition: TrailingPosition
}

// Represents an edit option on the ControlPanel.
export default function ConfigOption(props: ConfigOptionProps) {
  const classes = useStyles({ trailingPosition: props.trailingPosition })
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
