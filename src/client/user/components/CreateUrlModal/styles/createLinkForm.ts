import { createStyles, makeStyles } from '@material-ui/core'

type LinkFormStyles = {
  textFieldHeight: number
  isFile: boolean
  uploadFileError: string | null
  createShortLinkError: string | null
}

const useCreateLinkFormStyles = makeStyles((theme) =>
  createStyles({
    endAdornment: {
      flexShrink: 0,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(11.75),
    },
    labelText: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(1),
    },
    outlinedInput: {
      padding: theme.spacing(0),
    },
    outlinedTagsTextInput: {
      padding: theme.spacing(0),
      flexWrap: 'wrap',
    },
    input: {
      flexGrow: 1,
      height: '100%',
      minHeight: (props: LinkFormStyles) => props.textFieldHeight,
      padding: theme.spacing(0),
      lineHeight: 1.5,
    },
    fileInput: {
      flexGrow: 1,
      height: '100%',
      minHeight: (props: LinkFormStyles) => props.textFieldHeight,
      padding: theme.spacing(0),
      lineHeight: 1.5,
      backgroundColor: theme.palette.divider,
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden',
      justifyContent: 'space-between',
      borderRadius: '3px',
      [theme.breakpoints.up('sm')]: {
        backgroundColor: '#e8e8e8',
      },
    },
    tagsTextInput: {
      flexGrow: 1,
      height: '100%',
      minHeight: (props: LinkFormStyles) => props.textFieldHeight,
      width: 0,
      minWidth: '50px',
      padding: theme.spacing(0),
      marginLeft: theme.spacing(1),
      lineHeight: 1.5,
    },
    button: {
      height: '44px',
      margin: theme.spacing(6, 0, 2),
      padding: theme.spacing(1, 0),
      alignSelf: 'center',
      minWidth: '180px',
      [theme.breakpoints.up('sm')]: {
        alignSelf: 'flex-end',
        marginTop: theme.spacing(6.25),
        minWidth: '148px',
      },
    },
    shortUrlInput: {
      width: '100%',
    },
    tagsText: {
      width: '100%',
    },
    inputNotchedOutline: (props: LinkFormStyles) =>
      props.createShortLinkError ? { border: 'solid 2px #c85151' } : {},
    refreshIcon: {
      marginRight: theme.spacing(1),
      fill: theme.palette.primary.dark,
    },
    iconTest: {
      '&.svg': {
        fill: '#f00',
      },
    },
    linkTypeButton: {
      width: '125px',
      height: '50px',
      borderRadius: '10px',
    },
    linkTypeButtonEnabled: {
      backgroundColor: `${theme.palette.primary.main} !important`,
      boxShadow: '0 0 20px 0 rgba(69, 102, 130, 0.7)',
    },
    linkTypeWrapper: {
      marginTop: theme.spacing(5),
      background: `${theme.palette.primary.main}1A`,
      borderRadius: '10px',
      width: 'fit-content',
      overflow: 'hidden',
      [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(4),
      },
    },
    linkTypeUrlButtonText: {
      color: (props: LinkFormStyles) =>
        props.isFile ? 'unset' : theme.palette.background.default,
      marginLeft: '4px',
    },
    linkTypeFileButtonText: {
      color: (props: LinkFormStyles) =>
        props.isFile ? theme.palette.background.default : 'unset',
      marginLeft: '4px',
    },
    fileInputInvis: {
      display: 'none',
    },
    fileInputDescWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    fileInputWrapper: {
      width: '100%',
      display: 'flex',
      alignItems: 'stretch',
      borderRadius: '3px',
      overflow: 'hidden',
      border: (props: LinkFormStyles) =>
        props.uploadFileError ? '2px solid #C85151' : '',
    },
    maxSizeText: {
      marginLeft: '4px',
      fontWeight: 500,
    },
    maxSizeTextWrapper: {
      marginBottom: theme.spacing(1),
      display: 'flex',
      alignItems: 'stretch',
    },
    leftFileIcon: {
      width: '44px',
      backgroundColor: theme.palette.primary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileNameText: {
      fontWeight: 400,
      paddingLeft: '16px',
      display: 'flex',
      alignItems: 'center',
    },
    fileSizeText: {
      fontWeight: 400,
      display: 'flex',
      alignItems: 'center',
      paddingRight: theme.spacing(1.5),
    },
    uploadFileInputEndWrapper: {
      display: 'flex',
      alignItems: 'stretch',
    },
    uploadFileButton: {
      padding: 0,
      margin: 0,
      width: '81px',
      height: '100%',
      borderRadius: 0,
      color: theme.palette.background.default,
      [theme.breakpoints.up('sm')]: {
        width: '146px',
      },
    },
    shortLinkError: {
      color: 'black',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  }),
)

export default useCreateLinkFormStyles
