const loginPageStyle = (theme) => ({
  loginWrapper: {
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
  },
  headerOverlay: {
    zIndex: '1', // Cover header
    marginTop: '-120px',
    height: '110px',
    backgroundColor: theme.palette.secondary.dark,
  },
  login: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.secondary.dark,
  },
  paper: {
    margin: theme.spacing(0, 4, 8, 4),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(6, 5),
    maxWidth: '470px',
  },
  loginHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: '1px',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  logo: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  logoLink: {
    alignSelf: 'center',
    width: '161px',
    marginBottom: theme.spacing(7),
  },
  signInText: {
    fontSize: '2rem',
    fontWeight: '600',
  },
  loginField: {
    borderRadius: '4px',
  },
  loginInputText: {
    color: theme.palette.grey[800],
  },
  resendOTPBtn: {
    '&:disabled': {
      color: theme.palette.grey[300],
    },
  },
  progressBar: {
    marginTop: `${theme.spacing(4)}px`,
  },
  '@media screen\\0': {
    // Styles for Internet Explorer compatibility
    logoLink: {
      marginBottom: '0',
    },
  },
})

export default loginPageStyle
