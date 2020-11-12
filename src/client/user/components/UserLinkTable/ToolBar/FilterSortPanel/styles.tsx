import { createStyles, makeStyles } from '@material-ui/core'
import useSearchInputHeight from '../SearchInput/searchInputHeight'

export default makeStyles((theme) =>
  createStyles({
    collapse: {
      width: '100%',
      position: 'absolute',
      left: 0,
      top: useSearchInputHeight() + 10,
      zIndex: 1000,
      [theme.breakpoints.down('sm')]: {
        top: 0,
        height: '100% !important', // Bypass Material UI uses element style
        minHeight: '800px !important',
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
      margin: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        margin: theme.spacing(3),
      },
    },
    sortButtonGrid: {
      height: '67px',
      width: '100%',
    },
    sectionHeader: {
      paddingLeft: theme.spacing(4),
      [theme.breakpoints.up('md')]: {
        color: '#767676',
      },
    },
    sortHeaderGrid: {
      marginBottom: theme.spacing(1),
    },
    filterHeaderGrid: {
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(5.75),
      },
    },
    filterSectionGrid: {
      marginLeft: theme.spacing(4),
    },
    filterSectionHeader: {
      marginTop: theme.spacing(2.5),
      fontWeight: 500,
      marginBottom: theme.spacing(0.5),
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
      marginBottom: theme.spacing(0.5),
      [theme.breakpoints.down('sm')]: {
        marginBottom: theme.spacing(4),
      },
    },
    root: {
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      border: 'solid 1px #e8e8e8',
      height: '100%',
      overflow: 'hidden',
    },
    leftCheckbox: {
      marginLeft: theme.spacing(-1.5),
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
      paddingLeft: theme.spacing(3),
      fontWeight: 400,
      flex: 1,
      textAlign: 'left',
    },
    checkIcon: {
      marginLeft: 'auto',
      marginRight: theme.spacing(4),
      flexShrink: 0,
      flexGrow: 0,
    },
    sortButtonLabel: {
      display: 'flex',
      alignItems: 'flex-start',
    },
    applyButton: {
      width: '121px',
      height: '45px',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        height: '55px',
        marginRight: theme.spacing(4),
      },
    },
    footer: {
      marginTop: theme.spacing(6),
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
      [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(11),
        flexDirection: 'column-reverse',
      },
    },
    resetButton: {
      marginRight: theme.spacing(1.5),
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
    collapsingPanel: {
      width: '100%',
    },
  }),
)
