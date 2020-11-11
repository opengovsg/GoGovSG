import { createStyles, makeStyles } from '@material-ui/core'

type StyleProps = {
  appMargins: number
}

export default makeStyles((theme) =>
  createStyles({
    toolbar: {
      paddingLeft: (props: StyleProps) => props.appMargins,
      paddingRight: (props: StyleProps) => props.appMargins,
    },
    spacer: {
      flex: 0,
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
      zIndex: 2,
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    selectIcon: {
      zIndex: 2,
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  }),
)
