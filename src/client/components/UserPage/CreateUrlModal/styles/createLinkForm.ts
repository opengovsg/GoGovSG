import { createStyles, makeStyles } from '@material-ui/core'

type LinkFormStyles = {
  textFieldHeight: number
  isFile: boolean
  fileError: string | null
  createShortLinkError: string | null
}

const useCreateLinkFormStyles = makeStyles((theme) =>
  createStyles({
    startAdorment: {
      minHeight: (props: LinkFormStyles) => props.textFieldHeight,
      backgroundColor: '#f0f0f0',
      paddingRight: theme.spacing(1.5),
      borderRight: `1px solid ${theme.palette.divider}`,
      flexShrink: 0,
    },
    endAdornment: {
      flexShrink: 0,
    },
    startAdormentText: {
      width: '87px',
      paddingLeft: theme.spacing(1.5),
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(4),
    },
    labelText: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(1),
    },
    outlinedInput: {
      padding: theme.spacing(0),
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
      backgroundColor: '#d8d8d8',
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden',
      justifyContent: 'space-between',
      borderRadius: '3px',
      border: (props: LinkFormStyles) =>
        props.fileError ? 'solid 2px #c85151' : '',
      [theme.breakpoints.up('sm')]: {
        backgroundColor: '#e8e8e8',
      },
    },
    button: {
      height: '44px',
      margin: theme.spacing(6, 0, 2),
      padding: theme.spacing(1, 5),
      alignSelf: 'center',
      [theme.breakpoints.up('sm')]: {
        alignSelf: 'flex-end',
        marginTop: theme.spacing(12),
      },
    },
    shortUrlInput: {
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
      backgroundColor: '#384a51 !important',
      boxShadow: '0 0 20px 0 rgba(69, 102, 130, 0.7)',
    },
    linkTypeWrapper: {
      marginTop: theme.spacing(5),
      background: '#4566821A',
      borderRadius: '10px',
      width: 'fit-content',
      overflow: 'hidden',
      [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(4),
      },
    },
    linkTypeUrlButtonText: {
      color: (props: LinkFormStyles) => (props.isFile ? 'unset' : '#f9f9f9'),
      marginLeft: '4px',
    },
    linkTypeFileButtonText: {
      color: (props: LinkFormStyles) => (props.isFile ? '#f9f9f9' : 'unset'),
      marginLeft: '4px',
    },
    fileInputInvis: {
      display: 'none',
    },
    fileInputWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
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
      backgroundColor: '#8ca6ad',
      color: '#f9f9f9',
      [theme.breakpoints.up('sm')]: {
        width: '146px',
      },
    },
  }),
)

export default useCreateLinkFormStyles
