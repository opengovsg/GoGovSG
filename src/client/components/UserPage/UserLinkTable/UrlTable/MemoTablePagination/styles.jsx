import { createStyles, makeStyles } from '@material-ui/core'

export default makeStyles((theme) =>
  createStyles({
    root: {
      display: 'inline',
    },
    toolbar: {
      paddingLeft: 0,
      paddingRight: 0,
      width: '50%',
    },
    spacer: {
      flex: 0,
      paddingLeft: (props) => props.appMargins,
    },
    caption: {
      fontWeight: 400,
      marginRight: '4px',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    select: {
      border: 'solid 1px #d8d8d8',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    selectIcon: {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  }),
)
