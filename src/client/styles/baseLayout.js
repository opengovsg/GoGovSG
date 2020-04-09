const flexColumn = {
  display: 'flex',
  flexDirection: 'column',
}
const takeUpVerticalSpace = {
  ...flexColumn,
  flexGrow: 1 /* grow to occupy all available space */,
}
const baseLayoutStyle = theme => ({
  '@global': {
    body: {
      /* Make body take up the entire screen */
      position: 'absolute',
      minWidth: '100%',
      minHeight: '100vh',
      backgroundColor: '#fff',
      /* Make our root div flex so all the heroes will fall into a column */
      '& #root': {
        overflow: 'hidden',
        minHeight: '100vh',
        ...flexColumn,
      },
    },
    a: {
      textDecoration: 'none',
    },
  },
  masthead: {
    zIndex: '2',
    position: 'relative',
    backgroundColor: '#f0f0f0',
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
  appBar: {
    zIndex: '1',
    position: 'relative',
    /* keep appBar flush with the first hero */
    boxShadow: 'none',
    /* appBar should not shrink nor grow in height */
    flexShrink: 1,
    padding: theme.spacing(2, 6, 1),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2, 0, 1),
    },
  },
  toolbar: {
    /* For aligning logo and appbar buttons in a row */
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rowSpace: {
    /* takes up space logo and buttons */
    flexGrow: 0.85,
  },
  appBarSignOutBtn: {
    fill: theme.palette.primary.main,
  },
  appBarSignInBtn: {
    flexGrow: '0.05',
    minWidth: '90px',
  },
  toolbarLogo: {
    width: '130px',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(1),
    },
  },
  logo: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  layout: {
    /*
    This main container should take up all the space
    between the appbar and footer
    */
    ...takeUpVerticalSpace,
    /*
    Do the same for the div that's wrapping all the child components
    */
    '&>div': {
      ...takeUpVerticalSpace,
    },
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.secondary.dark,
    padding: theme.spacing(4, 10),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(4, 4),
    },
  },
  footerTitle: {
    display: 'inline',
    fontSize: '1.15rem',
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      display: 'block',
    },
  },
  subfooter: {
    paddingTop: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(1),
    },
  },
  footerItem: {
    [theme.breakpoints.down('xs')]: {
      padding: '8px 13px 8px 0 !important',
    },
  },
  footerLink: {
    fontWeight: '500',
  },
  builtByLink: {
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(5, 0, 1),
    },
  },
  builtByImg: {
    height: '55px',
    userDrag: 'none',
  },
})

export default baseLayoutStyle
