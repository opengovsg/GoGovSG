import { fade } from '@material-ui/core/styles'

const userPageStyle = theme => ({
  table: {
    flexGrow: '1',
    marginTop: '5px',
    boxShadow: '0 -3px 5px 0px rgba(0,0,0,0.1)',
  },
  bar: {
    backgroundColor: theme.palette.grey[500],
  },
  qrCodeModal: {
    outline: 'none',
    top: 'calc(50% - 250px)',
    left: 'calc(50% - 200px)',
    position: 'fixed',
    width: '400px',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '10px',
    padding: '16px',
    [theme.breakpoints.down('xs')]: {
      width: '80vw',
      top: '10vh',
      left: 'calc(50% - 40vw)',
    },
  },
  qrCodeModalTitle: {
    color: theme.palette.common.black,
    textAlign: 'center',
    padding: '10px',
    wordBreak: 'break-all',
    fontWeight: '500',
  },
  ownershipModal: {
    outline: 'none',
    top: 'calc(50% - 190px)',
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
  ownershipModalHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 2, 1, 4),
  },
  ownershipModalTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  closeIcon: {
    fill: '#767676',
  },
  ownershipModalBottomHalf: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(4),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  transferOwnershipTitle: {
    marginLeft: '1px',
    paddingBottom: theme.spacing(1),
  },
  transferOwnershipInput: {
    padding: theme.spacing(2),
  },
  transferOwnershipHint: {
    color: '#767676',
    padding: theme.spacing(1, 0, 3),
  },
  transferOwnershipBtns: {
    display: 'flex',
    padding: theme.spacing(3, 0),
  },
  transferOwnershipSubmitBtn: {
    padding: theme.spacing(1, 4),
    marginRight: theme.spacing(2),
  },
  transferOwnershipCancelBtn: {
    padding: theme.spacing(1),
    color: '#767676',
  },
  leftCell: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(7),
    },
    [theme.breakpoints.down('sm')]: {
      textAlign: 'left',
    },
  },
  rightCell: {
    [theme.breakpoints.up('md')]: {
      paddingRight: theme.spacing(3),
    },
  },
  iconButton: {
    padding: '0px',
  },
  textField: {
    backgroundColor: 'inherit',
    padding: '0px',
  },
  httpsInputAdornment: {
    wordBreak: 'keep-all',
  },
  saveInputAdornment: {
    margin: '0px',
  },
  editableTextField: {
    minWidth: '25vw',
  },
  shortBtn: {
    display: 'block',
    color: 'black',
  },
  shortBtnLabel: {
    fontWeight: '400',
    textAlign: 'left',
  },
  toolbar: {
    padding: theme.spacing(4, 10, 1),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(4, 2, 2),
    },
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolbarTitle: {
    padding: theme.spacing(1, 0),
  },
  toolbarActions: {
    flexGrow: '0.1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    padding: theme.spacing(1, 1),
  },
  createUrlBtn: {
    flexBasis: '130px',
    padding: theme.spacing(1, 0),
  },
  // url table
  tableHeadResponsive: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  tableBodyTitle: {
    display: 'none',
    [theme.breakpoints.down('sm')]: {
      display: 'inline-block',
      margin: 'auto 0',
      padding: theme.spacing(0, 1, 0, 10),
      width: '30%',
      fontSize: '0.75em',
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(0, 1, 0, 2),
    },
  },
  hoverRow: {
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.1),
    },
  },
})

export default userPageStyle
