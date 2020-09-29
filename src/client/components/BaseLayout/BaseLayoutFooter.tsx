import React from 'react'
import {
  Link,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import i18next from 'i18next'
import Section from '../Section'

const useStyles = makeStyles((theme) =>
  createStyles({
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        display: 'grid',
      },
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
      gridRow: 1,
      gridColumn: 2,
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
      [theme.breakpoints.down('sm')]: {
        display: 'grid',
        gridRow: 2,
        gridColumn: 1,
      },
    },
    navLink: {
      fontSize: '0.75rem',
      marginTop: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
      },
      [theme.breakpoints.down('sm')]: {
        marginLeft: 0,
      },
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(0),
      },
    },
    footerLink: {
      color: theme.palette.primary.dark,
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
          <div className={classes.navLinkGroup}>
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
      </footer>
    </Section>
  )
}

export default BaseLayoutFooter
