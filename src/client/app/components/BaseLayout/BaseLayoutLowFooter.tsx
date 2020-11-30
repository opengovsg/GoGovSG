import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import Section from '../Section'
import CopyrightWidget from './widgets/CopyrightWidget'
import LinkedinWidget from './widgets/LinkedinWidget'
import BuiltByWidget from './widgets/BuiltByWidget'
import FacebookWidget from './widgets/FacebookWidget'
import OgpWidget from './widgets/OgpWidget'

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

const BaseLayoutLowFooter = () => {
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
