import React, { FunctionComponent } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { ApplyAppMargins } from './AppMargins'

type styleProps = {
  backgroundType: string
  verticalMultiplier: number
  topMultiplier: number
  bottomMultiplier: number
  shadow: boolean
}

const useStyles = makeStyles((theme) =>
  createStyles({
    backgroundType: {
      width: '100%',
      backgroundColor: (props: styleProps) => {
        switch (props.backgroundType) {
          case 'light':
            return theme.palette.secondary.light
          case 'dark':
            return theme.palette.secondary.dark
          case 'darkest':
            return '#384A51'
          case 'black':
            return '#000000'
          default:
            return props.backgroundType
        }
      },
      boxShadow: (props: styleProps) =>
        props.shadow ? '0px 1px 1px rgba(216, 216, 216, 0.5)' : '0',
      '@media screen\\0': {
        minHeight: '1px',
      },
    },
    childrenPadding: {
      paddingTop: (props: styleProps) =>
        theme.spacing(8 * props.verticalMultiplier * props.topMultiplier),
      paddingBottom: (props: styleProps) =>
        theme.spacing(8 * props.verticalMultiplier * props.bottomMultiplier),
    },
  }),
)

type SectionProps = {
  backgroundType: string,
  verticalMultiplier?: number,
  topMultiplier?: number,
  bottomMultiplier?: number,
  className?: string,
  shadow?: boolean,
}

const Section: FunctionComponent<SectionProps> = ({
  children,
  backgroundType,
  verticalMultiplier = 1,
  topMultiplier = 1,
  bottomMultiplier = 1,
  className = '',
  shadow = false,
}) => {
  const classes = useStyles({
    backgroundType,
    verticalMultiplier,
    topMultiplier,
    bottomMultiplier,
    shadow,
  })
  return (
    <div className={`${className} ${classes.backgroundType}`}>
      <ApplyAppMargins>
        <div className={classes.childrenPadding}>{children}</div>
      </ApplyAppMargins>
    </div>
  )
}

Section.defaultProps = {
  backgroundType: 'light',
  verticalMultiplier: 1,
  topMultiplier: 1,
  bottomMultiplier: 1,
}

export default Section
