import { createStyles, makeStyles } from '@material-ui/core'
import { CollapsibleMessageStyles, CollapsibleMessageType } from './types'

export default makeStyles((theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    message: {
      width: '100%',
      backgroundColor: ({ type }: CollapsibleMessageStyles) =>
        type === CollapsibleMessageType.Success ? '#eaf9e7' : '#ffeded',
      display: 'flex',
      alignItems: 'center',
      color: ({ type }: CollapsibleMessageStyles) =>
        type === CollapsibleMessageType.Success ? '#6d9067' : '#c85151',
      fontSize: '13px',
      fontWeight: 400,
      padding: theme.spacing(1, 1.5),
    },
  }),
)
