const homePageStyle = (theme) => ({
  landingTop: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      // Fill whole screen
      height: `calc(100vh - ${theme.spacing(12)}px)`,
      maxHeight: '60vw', // Upper bound for large portrait devices
    },
    minHeight: '500px',
  },
  heroContent: {
    display: 'flex',
    flexWrap: 'wrap',
    [theme.breakpoints.up('xl')]: {
      flexWrap: 'nowrap',
    },
    justifyContent: 'space-between',
    paddingTop: theme.spacing(5),
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      paddingTop: theme.spacing(4),
    },
  },
  mainText: {
    marginRight: theme.spacing(-9),
    paddingLeft: theme.spacing(10),
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.up('xl')]: {
      marginRight: theme.spacing(-15),
    },
    [theme.breakpoints.down('xs')]: {
      marginRight: '0',
      padding: theme.spacing(0, 4, 4, 4),
    },
  },
  mainTitle: {
    maxWidth: '450px',
    [theme.breakpoints.up('xl')]: {
      maxWidth: '650px',
      fontSize: '4rem',
    },
    [theme.breakpoints.down('xs')]: {
      maxWidth: '350px',
      fontSize: '2rem',
    },
  },
  subtitle: {
    maxWidth: '330px',
    [theme.breakpoints.up('xl')]: {
      maxWidth: '450px',
      fontSize: '1.4rem',
    },
  },
  mainImageDiv: {
    alignSelf: 'flex-end',
    flexGrow: '1',
    width: '100%',
    flexBasis: '500px',
    zIndex: '99',
    marginLeft: 'auto',
    [theme.breakpoints.up('xl')]: {
      maxWidth: '90vh',
    },
    [theme.breakpoints.only('lg')]: {
      marginTop: theme.spacing(-2),
    },
    [theme.breakpoints.down('lg')]: {
      flexGrow: '1',
      minWidth: '500px',
      maxWidth: '650px',
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: '0px',
      paddingLeft: theme.spacing(3),
    },
  },
  mainImage: {
    userDrag: 'none',
    userSelect: 'none',
    objectFit: 'contain',
    width: '100%',
    position: 'relative',
    // Make image cut the background at the right height
    [theme.breakpoints.up('xl')]: {
      top: 'calc(100vh /17)',
    },
    [theme.breakpoints.only('lg')]: {
      top: '50px',
    },
    [theme.breakpoints.only('md')]: {
      top: 'calc(-10px + 100vw / 20)',
    },
    [theme.breakpoints.only('sm')]: {
      top: 'calc(10px + 100vw / 25)',
    },
    [theme.breakpoints.down('xs')]: {
      top: 'calc(100vw / 14)',
    },
  },
  mainSub: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    flexGrow: '1',
    padding: theme.spacing(0, 10),
    backgroundColor: theme.palette.primary.dark,
    [theme.breakpoints.down('sm')]: {
      alignItems: 'center',
      padding: theme.spacing(0, 3),
    },
  },
  learnMoreBtn: {
    marginTop: '-21px',
    [theme.breakpoints.down('sm')]: {
      marginTop: '15vw',
    },
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
  signInText: {
    margin: theme.spacing(2, 0),
    color: '#fdf3e8',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      marginBottom: '15vw',
    },
  },
  landingBottom: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  '@media screen\\0': {
    // Styles for Internet Explorer compatibility
    mainImageDiv: {
      flexBasis: '730px',
      width: '730px',
    },
    learnMoreBtn: {
      alignSelf: 'flex-start',
    },
  },
})

export default homePageStyle
