import React from 'react'
import {
  IconButton,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '../../app/components/widgets/CloseIcon'
import { TEXT_FIELD_HEIGHT } from '../constants'

const useStyles = makeStyles((theme) =>
  createStyles({
    tag: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.secondary.main,
      borderRadius: 5,
      minHeight: TEXT_FIELD_HEIGHT - theme.spacing(2),
      margin: theme.spacing(1, 0, 1, 1),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(0.75),
    },
    tagText: {
      color: '#FFFFFF',
      fontSize: '14px',
      marginRight: theme.spacing(0.75),
    },
    tagButton: {
      padding: 0,
    },
  }),
)

type FormTagProps = {
  tag: string
  onClose: () => void
}

export default function FormTag({ tag, onClose }: FormTagProps) {
  const classes = useStyles()
  return (
    <div className={classes.tag}>
      <Typography className={classes.tagText}>{tag}</Typography>
      <IconButton className={classes.tagButton} size="small" onClick={onClose}>
        <CloseIcon size={10} color="#FFFFFF" />
      </IconButton>
    </div>
  )
}
