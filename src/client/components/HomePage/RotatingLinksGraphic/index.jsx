import React from 'react'
import { connect } from 'react-redux'
import { createStyles, makeStyles } from '@material-ui/core'
import i18next from 'i18next'
import mainImage from '~/assets/landing-page-graphics/landing-main.svg'
import RotatingLinks from './RotatingLinks'

const mapStateToProps = (state) => ({
  linksToRotate: state.home.linksToRotate,
})

const useStyles = makeStyles((theme) =>
  createStyles({
    heroContainer: {
      resize: 'both',
      overflow: 'auto',
      width: '100vw',
      maxWidth: '765px',
      height: (props) => `${props.heightToWidthRatio * 100}vw`,
      maxHeight: '419px',
      position: 'relative',
      marginLeft: 'auto',
    },
    heroImage: {
      width: '100vw',
      maxWidth: '765px',
      height: (props) => `${props.heightToWidthRatio * 100}vw`,
      maxHeight: '419px',
      verticalAlign: 'top',
      position: 'absolute',
      left: 0,
      bottom: 0,
    },
    rotatingLinks: {
      width: (props) => `${props.linkBoxWidthToImageWidth * 100}vw`,
      maxWidth: '662.01px',
      height: (props) => `${props.linkBoxHeightToImageWidth * 100}vw`,
      maxHeight: '98.0139235px',
      fontSize: 'min(3.25vw, 26px)',
      fontWeight: 400,
      color: theme.palette.secondary.contrastText,
      opacity: 0.7,
      position: 'absolute',
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: (props) =>
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

const RotatingLinksGraphic = ({ linksToRotate }) => {
  const classes = useStyles({
    heightToWidthRatio: 419 / 765,
    linkBoxWidthToImageWidth: 662.01 / 765,
    linkBoxHeightToImageWidth: 98.0139235 / 765,
    rotatingLinkLeftMarginToLinkBox: 3.5 / 100,
  })
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
          strings={linksToRotate || ['whatsapp']}
        />
      </div>
    </div>
  )
}

export default connect(mapStateToProps, null)(RotatingLinksGraphic)
