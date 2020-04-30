import { createMuiTheme } from '@material-ui/core/styles'

import theme from '~/styles/theme'

const urlTableTheme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#456682',
    },
    secondary: {
      main: '#6d9067',
    },
  },
  typography: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    h1: {
      fontSize: '1.5rem',
      fontWeight: '500',
    },
    body1: {
      // MUI v4 body1 == body2
      fontSize: '0.8125rem',
    },
    body2: {
      fontSize: '0.8125rem',
    },
    button: {
      textTransform: 'none',
    },
  },
  overrides: {
    MuiButton: {
      root: {
        fontSize: '0.875rem',
        borderRadius: '30px',
      },
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: '#384A51',
        fontSize: '0.8125rem',
      },
      arrow: {
        color: '#384A51',
      },
    },
    MuiPaper: {
      root: {
        margin: '-50px 20px 30px',
      },
    },
    MuiTable: {
      root: {
        overflowX: 'auto',
        overflow: 'auto',
        [theme.breakpoints.down('sm')]: {
          overflowX: 'hidden',
          overflow: 'hidden',
          display: 'block',
        },
      },
    },
    MuiTableCell: {
      root: {
        [theme.breakpoints.down('sm')]: {
          padding: '0px 4px',
        },
      },
      body: {
        wordBreak: 'break-all',
        [theme.breakpoints.only('sm')]: {
          paddingRight: '80px',
        },
        [theme.breakpoints.down('sm')]: {
          margin: 'auto 0',
          fontSize: '16px',
          borderBottom: 'none',
          paddingBottom: '4px',
          width: '70%',
        },
      },
    },
    MuiTableBody: {
      root: {
        [theme.breakpoints.down('sm')]: {
          display: 'block',
        },
      },
    },
    MuiTableRow: {
      root: {
        [theme.breakpoints.down('sm')]: {
          // list of td will populate a column downwards
          // until 8 rows are reached (determined by height),
          // then wrap up to the next column
          display: 'flex',
          flexFlow: 'row wrap',
          height: '352px', // (cellStacked.minHeight + cellStacked.paddingBottom + responsiveStacked.minHeight + responsiveStacked.paddingBottom) * 4
          padding: '5px 5px 0px',
          border: 'solid 1px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiTablePagination: {
      toolbar: {
        paddingRight: '80px',
        [theme.breakpoints.down('sm')]: {
          padding: '0',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
        },
      },
      selectRoot: {
        [theme.breakpoints.down('sm')]: {
          margin: '0',
        },
      },
      actions: {
        [theme.breakpoints.down('sm')]: {
          margin: '0',
        },
      },
    },
  },
})

export default urlTableTheme
