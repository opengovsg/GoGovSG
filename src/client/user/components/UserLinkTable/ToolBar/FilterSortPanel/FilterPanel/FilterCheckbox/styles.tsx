import { createStyles, makeStyles } from '@material-ui/core'

export default makeStyles((theme) =>
  createStyles({
    uncheckedIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '2px',
      border: `solid 1px ${theme.palette.primary.main}`,
    },
    filled: {
      backgroundColor: theme.palette.primary.main,
      display: 'flex',
      alignItems: 'center',
      justifyContents: 'center',
    },
    icon: {
      width: '20px',
      display: 'flex',
      marginLeft: '-1px',
    },
  }),
)
