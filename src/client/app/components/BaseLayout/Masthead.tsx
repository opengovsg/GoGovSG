import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'

import lionHeadSymbol from '@assets/components/app/base-layout/lion-head-symbol.svg'

type MastheadProps = {
  isSticky: boolean
  toStick: boolean
}
const useStyles = makeStyles(() =>
  createStyles({
    masthead: {
      zIndex: 2,
      position: (props: MastheadProps) =>
        props.isSticky && props.toStick ? 'absolute' : 'relative',
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
  }),
)
const Masthead = ({ isSticky, toStick }: MastheadProps) => {
  const classes = useStyles({ isSticky, toStick })
  return (
    <div className={classes.masthead}>
      <a
        href="https://www.gov.sg"
        target="_blank"
        rel="noopener noreferrer"
        className={classes.mastheadLink}
      >
        <img src={lionHeadSymbol} alt="" />
        <span className={classes.mastheadText}>
          A Singapore Government Agency Website
        </span>
      </a>
    </div>
  )
}
export default Masthead
