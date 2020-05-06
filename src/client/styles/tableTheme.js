import { createMuiTheme } from '@material-ui/core/styles'

import theme from '../theme'

const urlTableTheme = createMuiTheme({
  overrides: {
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
