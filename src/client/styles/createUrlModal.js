const createUrlStyle = (theme) => ({
  createUrlModal: {
    outline: 'none',
    top: 'calc(50% - 180px)',
    left: 'calc(50% - 250px)',
    position: 'fixed',
    width: '500px',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '10px',
    [theme.breakpoints.down('xs')]: {
      width: '90vw',
      top: '15vh',
      left: 'calc(50% - 45vw)',
    },
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 1, 4),
  },
  closeIcon: {
    fill: '#767676',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1, 4, 4, 4),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  outlinedInput: {
    padding: theme.spacing(0),
  },
  input: {
    flexGrow: '1',
    width: '100px', // Override default
    padding: theme.spacing(0),
  },
  startAdorment: {
    height: '100%',
    width: '95px',
    maxHeight: '100px', // Override default
    backgroundColor: theme.palette.dividerLight,
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 0, 1, 2),
    fontSize: '0.8rem',
  },
  labelText: {
    marginLeft: '1px',
    marginTop: theme.spacing(3),
  },
  refreshIcon: {
    marginRight: theme.spacing(1),
    fill: '#767676',
  },
  button: {
    margin: theme.spacing(4, 0, 2),
    padding: theme.spacing(1, 5),
    alignSelf: 'flex-end',
  },
})

export default createUrlStyle
