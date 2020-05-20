import { createStyles, makeStyles } from '@material-ui/core'

export default makeStyles((theme) =>
  createStyles({
    collapse: {
      width: '100%',
      position: 'absolute',
      top: 60,
      zIndex: 1000,
      [theme.breakpoints.down('sm')]: {
        top: 0,
        height: '100% !important', // Bypass Material UI uses element style
        minHeight: '800px !important',
        left: 0,
      },
    },
    collapseWrapper: {
      [theme.breakpoints.down('sm')]: {
        height: '100%',
      },
    },
    closeIcon: {
      position: 'absolute',
      top: 0,
      right: 0,
      margin: '8px',
      [theme.breakpoints.down('sm')]: {
        margin: '24px',
      },
    },
    sortButtonGrid: {
      height: '67px',
      width: '100%',
    },
    sectionHeader: {
      paddingLeft: '32px',
      [theme.breakpoints.up('md')]: {
        color: '#767676',
      },
    },
    sortHeaderGrid: {
      marginBottom: '8px',
    },
    filterHeaderGrid: {
      marginTop: '12px',
      marginBottom: '8px',
      [theme.breakpoints.down('sm')]: {
        marginTop: '46px',
      },
    },
    filterSectionGrid: {
      marginLeft: '32px',
    },
    filterSectionHeader: {
      marginTop: '20px',
      fontWeight: 500,
      marginBottom: '4px',
    },
    filterLabelLeft: {
      fontWeight: 400,
      width: '100px',
    },
    filterLabelRight: {
      fontWeight: 400,
    },
    divider: {
      width: '100%',
    },
    dividerGrid: {
      marginBottom: '4px',
      [theme.breakpoints.down('sm')]: {
        marginBottom: '32px',
      },
    },
    root: {
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      border: 'solid 1px #e8e8e8',
      height: '100%',
      overflow: 'hidden',
    },
    leftCheckbox: {
      marginLeft: '-12px',
    },
    sortButtonRoot: {
      borderRadius: 0,
    },
    sortButton: {
      height: '100%',
      justifyContent: 'start',
    },
    sortButtonSelected: {
      height: '100%',
      justifyContent: 'start',
      background: '#f9f9f9',
    },
    columnLabel: {
      paddingLeft: '24px',
      fontWeight: 400,
    },
    checkIcon: {
      marginLeft: 'auto',
      marginRight: '32px',
      marginTop: '4px',
      width: '24px',
    },
    applyButton: {
      width: '121px',
      height: '45px',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        height: '55px',
        marginRight: '32px',
      },
    },
    footer: {
      marginTop: '48px',
      marginLeft: '32px',
      marginRight: '32px',
      [theme.breakpoints.down('sm')]: {
        marginTop: '88px',
        flexDirection: 'column-reverse',
      },
    },
    resetButton: {
      marginRight: '12px',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        height: '55px',
      },
    },
    buttonGrid: {
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
  }),
)
