import * as React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import { Variant } from '@material-ui/core/styles/createTypography'

type StylesProps = {
  trailingPosition: TrailingPosition
}

const useStyles = makeStyles((theme) =>
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
      [theme.breakpoints.down('sm')]: {
        marginRight: 0,
      },
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
  const classes = useStyles({ trailingPosition: props.trailingPosition })
  return (
    <main
      className={classes.mainContainer}
      style={{ flexWrap: props.wrapTrailing ? 'wrap' : 'nowrap' }}
    >
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
      <section
        className={classes.trailingContainer}
        style={{ width: props.wrapTrailing ? '100%' : 'unset' }}
      >
        {props.trailing}
      </section>
    </main>
  )
}
