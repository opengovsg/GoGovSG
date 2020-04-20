import React from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import trustedByMom from '~/assets/trusted-by-logos/1.png'
import trustedByLta from '~/assets/trusted-by-logos/2.png'
import trustedByMoh from '~/assets/trusted-by-logos/3.png'
import trustedByMsf from '~/assets/trusted-by-logos/4.png'
import trustedBySpf from '~/assets/trusted-by-logos/5.png'
import trustedByIras from '~/assets/trusted-by-logos/6.png'
import trustedByMoe from '~/assets/trusted-by-logos/7.png'
import trustedByMha from '~/assets/trusted-by-logos/8.png'

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      padding: theme.spacing(8, 4),
      width: '100%',
    },
    trustedByText: {
      paddingBottom: theme.spacing(2),
    },
    trustedByLogoGroup: {
      width: '100%',
      display: 'grid',
      alignItems: 'center',
      gridTemplateColumns: 'repeat(2, 1fr)',
      justifyContent: 'space-between',
      marginTop: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      },
    },
    trustedLogo: {
      userDrag: 'none',
      userSelect: 'none',
      objectFit: 'contain',
      width: '180px',
      maxHeight: '110px',
      padding: theme.spacing(4),
      [theme.breakpoints.up('sm')]: {
        width: '200px',
        maxHeight: '150px',
      },
      [theme.breakpoints.up('md')]: {
        width: '220px',
        maxHeight: '160px',
      },
    },
    '@media screen\\0': {
      trustedLogo: {
        width: 'auto',
      },
    },
  }),
)

const TrustedBySection = () => {
  const classes = useStyles()
  return (
    <main className={classes.container}>
      <Typography
        className={classes.trustedByText}
        variant="h2"
        color="textPrimary"
        gutterBottom
      >
        Trusted by these agencies
      </Typography>
      <div className={classes.trustedByLogoGroup}>
        <img className={classes.trustedLogo} src={trustedByMom} alt="MOM" />
        <img className={classes.trustedLogo} src={trustedByLta} alt="LTA" />
        <img className={classes.trustedLogo} src={trustedByMoh} alt="MOH" />
        <img className={classes.trustedLogo} src={trustedByMsf} alt="MSF" />
        <img className={classes.trustedLogo} src={trustedBySpf} alt="SPF" />
        <img className={classes.trustedLogo} src={trustedByIras} alt="IRAS" />
        <img className={classes.trustedLogo} src={trustedByMoe} alt="MOE" />
        <img className={classes.trustedLogo} src={trustedByMha} alt="MHA" />
      </div>
    </main>
  )
}

export default TrustedBySection
