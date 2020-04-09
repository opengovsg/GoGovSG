import { createMuiTheme } from '@material-ui/core/styles'
import sgdsIconsTtf from '~/assets/fonts/sgds-icons.ttf'
import sgdsIconsWoff from '~/assets/fonts/sgds-icons.woff'
import sgdsIconsSvg from '~/assets/fonts/sgds-icons.svg'

const theme = createMuiTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1440, // Only this is different from default
    },
  },
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
    },
  },
  typography: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    h1: {
      fontSize: '3rem',
      fontWeight: '600',
    },
    h2: {
      fontSize: '1.5rem',
    },
    h3: {
      fontSize: '1.2rem',
    },
    subtitle1: {
      lineHeight: '135%',
    },
    body1: { // MUI v4 body1 == body2
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '1rem',
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
        borderRadius: '30px',
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: '#f9f9f9',
      },
    },
    MuiCssBaseline: {
      '@global': {
        '@font-face': [ // Used for crest symbol in government masthead
          {
            fontFamily: 'sgds-icons',
            fontStyle: 'normal',
            fontWeight: 400,
            src: `
              url(${sgdsIconsTtf}) format("truetype"),
              url(${sgdsIconsWoff}) format("woff"),
              url(${sgdsIconsSvg}?#sgds-icons) format("svg");
            `,
            unicodeRange:
            'U+e948',
          },
        ],
      },
    },
    MuiOutlinedInput: {
      input: {
        '&:-webkit-autofill': {
          boxShadow: '0 0 0 100px #ffffff inset', // Override autofill background
        },
      },
      notchedOutline: {
        fontSize: '16px', // Must be same as InputLabel
      },
    },
    MuiInputLabel: {
      root: {
        fontSize: '16px',
      },
    },
  },
})

export default theme
