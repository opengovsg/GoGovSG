import React, { FunctionComponent, PropsWithChildren } from 'react'
import {
  IconButton,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '../../../app/components/widgets/CloseIcon'
import { TEXT_FIELD_HEIGHT } from './FormStartAdorment'

type FormTagStyles = {
  textFieldHeight: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    tag: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.secondary.main,
      borderRadius: 5,
      minHeight: (props: FormTagStyles) =>
        props.textFieldHeight - theme.spacing(2),
      margin: theme.spacing(1, 0, 1, 1),
    },
    tagText: {
      color: '#FFFFFF',
      fontSize: '14px',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(0.5),
    },
  }),
)

type FormTagProps = {
  tag: string
  onClose: () => void
}

const FormTag: FunctionComponent<FormTagProps> = ({
  tag,
  onClose,
}: PropsWithChildren<FormTagProps>) => {
  const classes = useStyles({ textFieldHeight: TEXT_FIELD_HEIGHT })
  return (
    <div className={classes.tag}>
      <Typography className={classes.tagText}>
        {tag}{' '}
        <IconButton size="small" onClick={onClose}>
          <CloseIcon size={10} color="#FFFFFF" />
        </IconButton>
      </Typography>
    </div>
  )
}

export default FormTag
