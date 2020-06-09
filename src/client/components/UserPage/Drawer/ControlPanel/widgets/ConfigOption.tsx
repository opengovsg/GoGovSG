import * as React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import { Variant } from '@material-ui/core/styles/createTypography'

type StylesProps = {
  trailingPosition: TrailingPosition
  wrapTrailing?: boolean
}

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(3.5),
      flexWrap: (props: StylesProps) =>
        props.wrapTrailing ? 'wrap' : 'nowrap',
    },
    leadingContainer: {
      flex: 1,
      marginBottom: 8,
      flexBasis: '100%',
      [theme.breakpoints.up('md')]: {
        flexBasis: 0,
        marginBottom: 0,
        marginRight: 19,
      },
      position: 'relative',
    },
    trailingContainer: {
      marginTop: (props: StylesProps) =>
        props.trailingPosition == TrailingPosition.end ? 'auto' : 'unset',
      marginBottom: (props: StylesProps) =>
        props.trailingPosition == TrailingPosition.start ? 'auto' : 'unset',
      width: (props: StylesProps) => (props.wrapTrailing ? '100%' : 'unset'),
    },
  }),
)

export enum TrailingPosition {
  start,
  center,
  end,
}

type ConfigOptionProps = {
  title: string | React.ReactNode
  subtitle?: string
  leading?: React.ReactNode
  trailing: React.ReactNode
  trailingPosition: TrailingPosition
  titleVariant: Variant
  titleClassName?: string
  wrapTrailing?: boolean
}

// Represents an edit option on the ControlPanel.
export default function ConfigOption(props: ConfigOptionProps) {
  const classes = useStyles({
    trailingPosition: props.trailingPosition,
    wrapTrailing: props.wrapTrailing,
  })
  return (
    <main className={classes.mainContainer}>
      <section className={classes.leadingContainer}>
        <Typography
          variant={props.titleVariant}
          className={props.titleClassName}
        >
          {props.title}
        </Typography>
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
