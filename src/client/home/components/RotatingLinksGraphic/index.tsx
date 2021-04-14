import React from 'react'
import { useSelector } from 'react-redux'
import { createStyles, makeStyles } from '@material-ui/core'
import i18next from 'i18next'
import mainImage from '@assets/components/home/rotating-links-graphic/landing-main.svg'
import RotatingLinks from './RotatingLinks'
import { GoGovReduxState } from '../../../app/reducers/types'

type styleProps = {
  heightToWidthRatio: number
  linkBoxWidthToImageWidth: number
  linkBoxHeightToImageWidth: number
  rotatingLinkLeftMarginToLinkBox: number
  targetImageWidthPx: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    heroContainer: {
      position: 'relative',
      width: '100vw',
      maxWidth: (props: styleProps) => `${props.targetImageWidthPx}px`,
      height: (props: styleProps) => `${props.heightToWidthRatio * 100}vw`,
      maxHeight: (props: styleProps) =>
        `${props.targetImageWidthPx * props.heightToWidthRatio}px`,
      marginLeft: 'auto',
      marginRight: '-1.5px',
      marginBottom: (props: styleProps) =>
        `max(${props.linkBoxHeightToImageWidth * -50}vw, calc((${
          -1 * props.linkBoxHeightToImageWidth * props.targetImageWidthPx
        }px / 2)))`,
      '@media screen\\0': {
        marginBottom: (props: styleProps) =>
          `calc((${
            -1 * props.linkBoxHeightToImageWidth * props.targetImageWidthPx
          }px / 2))`,
      },
    },
    heroImage: {
      position: 'absolute',
      width: '100vw',
      maxWidth: (props: styleProps) => `${props.targetImageWidthPx}px`,
      height: (props: styleProps) => `${props.heightToWidthRatio * 100}vw`,
      maxHeight: (props: styleProps) =>
        `${props.targetImageWidthPx * props.heightToWidthRatio}px`,
      verticalAlign: 'top',
      left: 0,
      bottom: 0,
    },
    rotatingLinks: {
      position: 'absolute',
      width: (props: styleProps) => `${props.linkBoxWidthToImageWidth * 100}vw`,
      maxWidth: (props: styleProps) =>
        `${props.linkBoxWidthToImageWidth * props.targetImageWidthPx}px`,
      height: (props: styleProps) =>
        `${props.linkBoxHeightToImageWidth * 100}vw`,
      maxHeight: (props: styleProps) =>
        `${props.linkBoxHeightToImageWidth * props.targetImageWidthPx}px`,
      fontSize: 'min(3.25vw, 26px)',
      fontWeight: 400,
      color: theme.palette.secondary.contrastText,
      opacity: 0.7,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: (props: styleProps) =>
        `${
          props.linkBoxWidthToImageWidth *
          props.rotatingLinkLeftMarginToLinkBox *
          100
        }vw`,
      '@media screen\\0': {
        fontSize: '26px',
      },
    },
  }),
)

const RotatingLinksGraphic = () => {
  const classes = useStyles({
    heightToWidthRatio: 419 / 765,
    linkBoxWidthToImageWidth: 662.01 / 765,
    linkBoxHeightToImageWidth: 98.0139235 / 765,
    rotatingLinkLeftMarginToLinkBox: 3.5 / 100,
    // Specifies max width of the graphic in px.
    targetImageWidthPx: 765,
  })
  const linksToRotate = useSelector(
    (state: GoGovReduxState) => state.home.linksToRotate,
  )
  return (
    <div className={classes.heroContainer}>
      <img
        className={classes.heroImage}
        src={mainImage}
        alt={i18next.t('general.appTitle')}
      />
      <div className={classes.rotatingLinks}>
        <RotatingLinks
          prefix={i18next.t('general.shortUrlPrefix')}
          strings={linksToRotate || []}
        />
      </div>
    </div>
  )
}

export default RotatingLinksGraphic
