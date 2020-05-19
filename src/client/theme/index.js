import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import sgdsIconsTtf from '~/assets/fonts/sgds-icons.ttf'
import sgdsIconsWoff from '~/assets/fonts/sgds-icons.woff'
import sgdsIconsSvg from '~/assets/fonts/sgds-icons.svg'

// Provides theme spacing, breakpoint values for the main theme to consume.
const basicTheme = createMuiTheme({
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

export default responsiveFontSizes(
  createMuiTheme({
    breakpoints: basicTheme.breakpoints,
    palette: {
      type: 'light',
      dividerLight: '#f0f0f0',
      divider: '#d8d8d8',
      primary: {
        main: '#456682',
        dark: '#384A51',
        contrastText: '#fff',
      },
      secondary: {
        main: '#fff',
        dark: '#f9f9f9',
        contrastText: '#000',
      },
      text: {
        primary: '#000',
        secondary: '#767676',
      },
    },
    typography: {
      fontFamily: "'IBM Plex Sans', sans-serif",
      h1: {
        fontSize: '3.25rem',
        fontWeight: '600',
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: '600',
      },
      h3: {
        fontSize: '1.2rem',
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle1: {
        fontSize: '1.2rem',
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
      caption: {
        fontSize: '0.8rem',
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
      },
      MuiAppBar: {
        colorPrimary: {
          backgroundColor: '#f9f9f9',
        },
      },
      MuiCssBaseline: {
        '@global': {
          // Used for crest symbol in government masthead.
          '@font-face': [
            {
              fontFamily: 'sgds-icons',
              fontStyle: 'normal',
              fontWeight: 400,
              src: `
              url(${sgdsIconsTtf}) format("truetype"),
              url(${sgdsIconsWoff}) format("woff"),
              url(${sgdsIconsSvg}?#sgds-icons) format("svg");
            `,
              unicodeRange: 'U+e948',
            },
          ],
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
          fontWeight: '500',
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
          borderBottom: '1px solid #d8d8d860',
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
    },
  }),
)
