import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import Section from '../Section.js'
import CopyrightWidget from './widgets/CopyrightWidget.js'
import LinkedinWidget from './widgets/LinkedinWidget.js'
import BuiltByWidget from './widgets/BuiltByWidget.js'
import FacebookWidget from './widgets/FacebookWidget.js'
import OgpWidget from './widgets/OgpWidget.js'

const useStyles = makeStyles((theme) =>
  createStyles({
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    iconGroup: {
      display: 'inline-flex',
      justifyContent: 'flex-end',
    },
    icons: {
      marginLeft: theme.spacing(3),
      marginRight: '0px',
      [theme.breakpoints.down('sm')]: {
        marginLeft: '0px',
        marginRight: theme.spacing(3),
      },
    },
    displayGroup: {
      display: 'inline-grid',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    buildByLink: {
      display: 'inline-flex',
      flexGrow: 1,
      align: 'right',
    },
    copyRightGroup: {
      display: 'inline-grid',
      textAlign: 'right',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        textAlign: 'left',
      },
    },
  }),
)

function BaseLayoutLowFooter() {
  const classes = useStyles()

  return (
    <Section backgroundType="black" verticalMultiplier={0.5}>
      <div style={{ display: 'inline' }}>
        <footer className={classes.footer}>
          <div className={classes.buildByLink}>
            <BuiltByWidget />
          </div>

          <div className={classes.displayGroup}>
            <div className={classes.iconGroup}>
              <LinkedinWidget className={classes.icons} />
              <FacebookWidget className={classes.icons} />
              <OgpWidget className={classes.icons} />
            </div>

            <div className={classes.copyRightGroup}>
              <CopyrightWidget />
            </div>
          </div>
        </footer>
      </div>
    </Section>
  )
}

export default BaseLayoutLowFooter
