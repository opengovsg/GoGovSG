import React from 'react'
import { Theme, createStyles, makeStyles } from '@material-ui/core'
type MastheadProps = {
  isSticky: boolean
  message: object
}
const useStyles = makeStyles<Theme, MastheadProps>(() =>
  createStyles({
    masthead: {
      zIndex: 2,
      position: (props) => (props.isSticky && props.message)? 'absolute':'relative',
      backgroundColor: '#F0F0F0',
      height: 'auto',
      padding: '4px 0',
      fontSize: '14px',
    },
    mastheadLink: {
      marginLeft: '30px',
      fontFamily: 'lato',
      color: '#484848',
      display: 'flex',
      alignItems: 'center',
      '&:hover': {
        color: '#151515',
      },
    },
    mastheadText: {
      marginLeft: '4px',
    },
    mastheadIcon: {
      fontSize: '20px',
      fontFamily: 'sgds-icons !important',
      speak: 'none',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontVariant: 'normal',
      textTransform: 'none',
      lineHeight: 1,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      '&:before': {
        content: '"\\e948"',
        color: '#db0000',
      },
    },
  }),
)
const Masthead = ({ isSticky, message }: MastheadProps) => {
  const classes = useStyles({ isSticky, message })
  return (
    <div className={classes.masthead}>
      <a
        href="https://www.gov.sg"
        target="_blank"
        rel="noopener noreferrer"
        className={classes.mastheadLink}
      >
        <span className={classes.mastheadIcon} />
        <span className={classes.mastheadText}>
          A Singapore Government Agency Website
        </span>
      </a>
    </div>
  )
}
export default Masthead