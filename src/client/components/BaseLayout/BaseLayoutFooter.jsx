import React from 'react'
import {
  Hidden,
  Link,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import i18next from 'i18next'
import Section from '../Section'
import CopyrightWidget from './widgets/CopyrightWidget'
import BuiltByWidget from './widgets/BuiltByWidget'

const useStyles = makeStyles((theme) =>
  createStyles({
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    footerGrid: {
      display: 'grid',
      maxWidth: '100%',
    },
    appHeaderGroup: {
      gridRow: 1,
      display: 'flex',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    appTitle: {
      marginRight: theme.spacing(2),
      fontWeight: 700,
    },
    appCatchPhrase: {
      fontWeight: 400,
    },
    navLinkGroup: {
      gridRow: 2,
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        flexDirection: 'row',
      },
      [theme.breakpoints.up('md')]: {
        gridColumn: 1,
        marginBottom: theme.spacing(0),
        alignItems: 'center',
      },
    },
    navLink: {
      fontSize: '0.75rem',
      marginTop: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        marginRight: theme.spacing(3),
      },
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(0),
      },
    },
    footerLink: {
      color: theme.palette.primary.dark,
    },
    copyright: {
      gridRow: 4,
    },
    copyrightDivider: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
    buildByLink: {
      gridRow: 3,
    },
  }),
)

const BaseLayoutFooter = () => {
  const classes = useStyles()

  const footers = [
    { text: 'FAQ', link: i18next.t('general.links.faq') },
    {
      text: 'Help us improve',
      link: i18next.t('general.links.contact'),
    },
    { text: 'Privacy', link: i18next.t('general.links.privacy') },
    { text: 'Terms of Use', link: i18next.t('general.links.terms') },
  ]

  return (
    <Section backgroundType="dark" verticalMultiplier={0.5}>
      <footer className={classes.footer}>
        <div className={classes.footerGrid}>
          <div className={classes.appHeaderGroup}>
            <Typography
              className={classes.appTitle}
              variant="body1"
              color="textPrimary"
            >
              <strong>{i18next.t('general.appTitle')}</strong>
            </Typography>
            <Typography
              variant="body2"
              color="textPrimary"
              noWrap
              className={classes.appCatchPhrase}
            >
              {i18next.t('general.appCatchphrase.noStyle')}
            </Typography>
          </div>
          <div className={classes.copyright}>
            <Hidden mdUp>
              <CopyrightWidget />
            </Hidden>
          </div>
          <div className={classes.navLinkGroup}>
            <Hidden smDown>
              <CopyrightWidget />
              <Typography className={classes.copyrightDivider}>|</Typography>
            </Hidden>
            {footers.map((footer) => (
              <Typography
                className={classes.navLink}
                key={footer.text}
                variant="caption"
              >
                <Link
                  className={classes.footerLink}
                  target="_blank"
                  href={footer.link}
                >
                  {footer.text}
                </Link>
              </Typography>
            ))}
          </div>
          <div className={classes.buildByLink}>
            <Hidden mdUp>
              <BuiltByWidget />
            </Hidden>
          </div>
        </div>
        <Hidden smDown>
          <BuiltByWidget />
        </Hidden>
      </footer>
    </Section>
  )
}

export default BaseLayoutFooter
