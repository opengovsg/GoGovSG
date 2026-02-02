import * as React from 'react'
import {
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

export enum TrailingPosition {
  start,
  center,
  end,
  none,
}

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
      marginBottom: (props: StylesProps) =>
        props.trailingPosition === TrailingPosition.none ? 0 : theme.spacing(3),
      flexBasis: '100%',
      [theme.breakpoints.up('md')]: {
        flexBasis: 0,
        marginBottom: () => 0, // Function can only be overwritten by another function
        marginRight: (props: StylesProps) =>
          props.trailingPosition === TrailingPosition.none ? 0 : 19,
      },
      position: 'relative',
    },
    trailingContainer: {
      marginTop: (props: StylesProps) =>
        props.trailingPosition === TrailingPosition.end ? 'auto' : 'unset',
      marginBottom: (props: StylesProps) =>
        props.trailingPosition === TrailingPosition.start ? 'auto' : 'unset',
      width: (props: StylesProps) => (props.wrapTrailing ? '100%' : 'unset'),
    },
    regularText: {
      fontWeight: 400,
    },
  }),
)

type ConfigOptionProps = {
  title: string | React.ReactNode
  mobile?: boolean
  subtitle?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  trailingPosition: TrailingPosition
  wrapTrailing?: boolean
}

// Represents an edit option on the ControlPanel.
export default function ConfigOption({
  title,
  mobile = false,
  subtitle,
  leading,
  trailing,
  trailingPosition,
  wrapTrailing,
}: ConfigOptionProps) {
  const classes = useStyles({
    trailingPosition,
    wrapTrailing,
  })
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const titleVariant = mobile ? 'h6' : 'body2'
  const titleClass = mobile && !isMobileView ? '' : classes.regularText
  return (
    <main className={classes.mainContainer}>
      <section className={classes.leadingContainer}>
        <Typography variant={titleVariant} className={titleClass}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="textSecondary">
            {subtitle}
          </Typography>
        )}
        {leading}
      </section>
      <section className={classes.trailingContainer}>{trailing}</section>
    </main>
  )
}
