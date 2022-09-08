import React, { FunctionComponent, PropsWithChildren } from 'react'
import {
  InputAdornment,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { TEXT_FIELD_HEIGHT } from '../../constants'

type StyleProps = {
  textFieldHeight: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    startAdorment: {
      minHeight: (props: StyleProps) => props.textFieldHeight,
      backgroundColor: '#f0f0f0',
      paddingRight: theme.spacing(1.5),
      borderRight: `1px solid ${theme.palette.divider}`,
      flexShrink: 0,
    },
    startAdormentText: {
      width: '87px',
      paddingLeft: theme.spacing(1.5),
    },
  }),
)

type FormStartAdormentProps = {}

const FormStartAdorment: FunctionComponent = ({
  children,
}: PropsWithChildren<FormStartAdormentProps>) => {
  const classes = useStyles({
    textFieldHeight: TEXT_FIELD_HEIGHT,
  })
  return (
    <InputAdornment className={classes.startAdorment} position="start">
      <Typography className={classes.startAdormentText} color="textSecondary">
        {children}
      </Typography>
    </InputAdornment>
  )
}

export default FormStartAdorment
