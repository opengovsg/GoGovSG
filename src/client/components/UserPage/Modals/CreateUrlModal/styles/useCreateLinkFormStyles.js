import { createStyles, makeStyles } from '@material-ui/core'

const useCreateLinkFormStyles = makeStyles((theme) =>
  createStyles({
    startAdorment: {
      minHeight: (props) => props.textFieldHeight,
      backgroundColor: theme.palette.dividerLight,
      paddingRight: theme.spacing(1.5),
      borderRight: `1px solid ${theme.palette.divider}`,
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
      marginBottom: theme.spacing(0.5),
    },
    outlinedInput: {
      padding: theme.spacing(0),
    },
    input: {
      flexGrow: '1',
      height: '100%',
      minHeight: (props) => props.textFieldHeight,
      padding: theme.spacing(0),
      lineHeight: 1.5,
    },
    button: {
      width: '180px',
      margin: theme.spacing(4, 0, 2),
      padding: theme.spacing(1, 5),
      alignSelf: 'center',
    },
    refreshIcon: {
      marginRight: theme.spacing(1),
      fill: theme.palette.primary.dark,
    },
  }),
)

export default useCreateLinkFormStyles
