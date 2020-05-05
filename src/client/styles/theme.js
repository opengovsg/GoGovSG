import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import sgdsIconsTtf from '~/assets/fonts/sgds-icons.ttf'
import sgdsIconsWoff from '~/assets/fonts/sgds-icons.woff'
import sgdsIconsSvg from '~/assets/fonts/sgds-icons.svg'

const theme = responsiveFontSizes(
  createMuiTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        // Only this is different from default
        xl: 1440,
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
      subtitle1: {
        fontSize: '1.2rem',
        lineHeight: 1.5,
      },
      body1: {
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
      MuiDivider: {
        root: {
          width: '50vw',
          margin: '16px 0px',
        },
      },
      MuiButton: {
        root: {
          borderRadius: '40px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
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
    },
  }),
)

export default theme
