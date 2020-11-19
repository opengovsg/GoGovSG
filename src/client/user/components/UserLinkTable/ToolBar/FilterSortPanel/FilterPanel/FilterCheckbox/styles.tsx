import { createStyles, makeStyles } from '@material-ui/core'

export default makeStyles(() =>
  createStyles({
    uncheckedIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '2px',
      border: 'solid 1px #384a51',
    },
    filled: {
      backgroundColor: '#384a51',
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
