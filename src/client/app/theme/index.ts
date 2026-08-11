import { PaletteType } from '@material-ui/core'
import { createTheme, responsiveFontSizes } from '@material-ui/core/styles'
import assetVariant from '../../../shared/util/asset-variant'

// Provides theme spacing, breakpoint values for the main theme to consume.
const basicTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1440,
    },
  },
})

const paletteVariants = {
  gov: {
    type: 'light' as PaletteType,
    divider: '#d8d8d8',
    primary: {
      main: '#456682',
      dark: '#384A51',
      contrastText: '#fff',
    },
    secondary: {
      light: '#CDDCE0',
      main: '#8CA6AD',
      dark: '#2F4B62',
      contrastText: '#000',
    },
    text: {
      primary: '#384A51',
      secondary: '#767676',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
  },
  edu: {
    type: 'light' as PaletteType,
    divider: '#d8d8d8',
    primary: {
      main: '#48426D',
      dark: '#2B2E4A',
      contrastText: '#fff',
    },
    secondary: {
      light: '#D5CDE0',
      main: '#8F8AB0',
      dark: '#2B2E4A',
      contrastText: '#000',
    },
    text: {
      primary: '#48426D',
      secondary: '#767676',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
  },
  health: {
    type: 'light' as PaletteType,
    divider: '#d8d8d8',
    primary: {
      main: '#6D4559',
      dark: '#472F40',
      contrastText: '#fff',
    },
    secondary: {
      light: '#F1D4DF',
      main: '#AB7F95',
      dark: '#472F40',
      contrastText: '#000',
    },
    text: {
      primary: '#6D4559',
      secondary: '#767676',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
  },
}

const palette = paletteVariants[assetVariant]

export default responsiveFontSizes(
  createTheme({
    breakpoints: basicTheme.breakpoints,
    palette,
    typography: {
      fontFamily: "'IBM Plex Sans', sans-serif",
      h1: {
        fontSize: '3.4375rem',
        fontWeight: 600,
        lineHeight: 1.182,
      },
      h2: {
        fontSize: '2.8125rem',
        fontWeight: 500,
        lineHeight: 1.267,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.321,
      },
      h4: {
        fontSize: '1.375rem',
        fontWeight: 600,
        lineHeight: 1.364,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 700,
        lineHeight: 1.389,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.3125,
      },
      subtitle1: {
        fontSize: '1.2rem',
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5625,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.429,
      },
      caption: {
        fontSize: '0.8125rem',
        lineHeight: 1.308,
        color: palette.text.secondary,
      },
      button: {
        textTransform: 'none',
      },
    },
    overrides: {
      MuiButton: {
        root: {
          borderRadius: '40px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          '&:active': {
            boxShadow: 'none',
          },
        },
        outlinedPrimary: {
          border: `1px solid ${palette.primary.main}`,
          backgroundColor: basicTheme.palette.common.white,
          '&:hover': {
            backgroundColor: basicTheme.palette.grey[100],
          },
          '&:active': {
            backgroundColor: palette.primary.main,
            color: basicTheme.palette.common.white,
          },
          '&:disabled': {
            color: '#bbb',
            border: `1px solid #bbb`,
          },
        },
      },
      MuiAppBar: {
        colorPrimary: {
          backgroundColor: palette.background.default,
        },
      },
      MuiInputBase: {
        input: {
          fontSize: '14px',
        },
      },
      MuiOutlinedInput: {
        input: {
          '&:-webkit-autofill': {
            // Override autofill background.
            boxShadow: '0 0 0 100px #ffffff inset',
          },
        },
        notchedOutline: {
          // Must be same as InputLabel.
          fontSize: '16px',
        },
      },
      MuiInputLabel: {
        root: {
          fontSize: '16px',
        },
      },
      MuiLink: {
        root: {
          fontWeight: 500,
        },
      },
      MuiTooltip: {
        tooltip: {
          backgroundColor: palette.text.primary,
          fontSize: '0.8125rem',
        },
        arrow: {
          color: palette.text.primary,
        },
      },
      MuiTable: {
        root: {
          overflowX: 'auto',
          overflow: 'auto',
          [basicTheme.breakpoints.down('sm')]: {
            overflowX: 'hidden',
            overflow: 'hidden',
            display: 'block',
          },
        },
      },
      MuiTableCell: {
        root: {
          paddingTop: basicTheme.spacing(2),
          paddingBottom: basicTheme.spacing(2),
          paddingLeft: 0,
          paddingRight: basicTheme.spacing(4),
          borderBottom: `1px solid ${palette.divider}60`,
        },
        body: {
          wordBreak: 'break-all',
          [basicTheme.breakpoints.only('sm')]: {
            paddingRight: '80px',
          },
          [basicTheme.breakpoints.down('sm')]: {
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
          [basicTheme.breakpoints.down('sm')]: {
            display: 'block',
          },
        },
      },
      MuiTableRow: {
        root: {
          [basicTheme.breakpoints.down('sm')]: {
            display: 'flex',
            flexFlow: 'row wrap',
            height: '352px',
            padding: '5px 5px 0px',
            border: 'solid 1px rgba(0, 0, 0, 0.15)',
          },
        },
      },
      MuiTablePagination: {
        toolbar: {
          paddingRight: '80px',
          [basicTheme.breakpoints.down('sm')]: {
            padding: '0',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-evenly',
          },
        },
        selectRoot: {
          [basicTheme.breakpoints.down('sm')]: {
            margin: '0',
          },
        },
        actions: {
          [basicTheme.breakpoints.down('sm')]: {
            margin: '0',
          },
        },
      },
      MuiDivider: {
        root: {
          backgroundColor: '#e8e8e8',
        },
      },
    },
  }),
)
