import React from 'react'
import { Link, Typography, createStyles, makeStyles } from '@material-ui/core'
import i18next from 'i18next'
import BuiltByImg from '~/assets/built-by.png'
import Section from '../Section'

const useStyles = makeStyles((theme) =>
  createStyles({
    footer: {
      display: 'grid',
      maxWidth: '100%',
      gridGap: theme.spacing(2),
    },
    appHeaderGroup: {
      gridRow: 1,
      display: 'flex',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
    },
    appTitle: {
      marginRight: theme.spacing(2),
    },
    navLinkGroup: {
      gridRow: 2,
      display: 'grid',
      gridGap: theme.spacing(2),
      gridAutoFlow: 'row',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    footerLink: {
      color: theme.palette.primary.dark,
    },
    builtByLinkGroup: {
      gridRow: 3,
    },
    builtByImg: {
      height: '55px',
      userDrag: 'none',
    },
    copyright: {
      gridRow: 4,
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
    <Section backgroundType="dark">
      <footer className={classes.footer}>
        <span className={classes.appHeaderGroup}>
          <Typography
            className={classes.appTitle}
            variant="h3"
            color="textPrimary"
          >
            <strong>{i18next.t('general.appTitle')}</strong>
          </Typography>
          <Typography variant="body1" color="textPrimary" noWrap>
            {i18next.t('general.appCatchphrase.noStyle')}
          </Typography>
        </span>
        <Typography
          className={classes.copyright}
          variant="caption"
          color="textPrimary"
        >
          {i18next.t('general.copyright')}
        </Typography>
        <span className={classes.navLinkGroup}>
          {footers.map((footer) => (
            <Typography key={footer.text} variant="caption">
              <Link
                className={classes.footerLink}
                target="_blank"
                href={footer.link}
              >
                {footer.text}
              </Link>
            </Typography>
          ))}
        </span>
        <span className={classes.builtByLinkGroup}>
          <Link
            href={i18next.t('general.links.builtBy')}
            target="_blank"
            style={{ height: '100%' }}
          >
            <img
              src={BuiltByImg}
              className={classes.builtByImg}
              alt={i18next.t('general.builtBy')}
            />
          </Link>
        </span>
      </footer>
    </Section>
  )
}

export default BaseLayoutFooter
