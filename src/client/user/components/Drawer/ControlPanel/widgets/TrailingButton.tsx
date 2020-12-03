import React, { FunctionComponent, PropsWithChildren } from 'react'
import {
  Button,
  ButtonProps,
  createStyles,
  makeStyles,
} from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    trailingButton: {
      height: 44,
      padding: 0,
      fontSize: '0.875rem',
      marginTop: theme.spacing(0.5),
      width: (props: ButtonProps) => (props.fullWidth ? '100%' : 135),
      [theme.breakpoints.up('md')]: {
        marginTop: 0,
      },
    },
  }),
)

type TrailingButtonProps = {
  className?: string
  onClick?:
    | (() => void)
    | ((event: React.MouseEvent<HTMLButtonElement>) => void)
  disabled?: boolean
  fullWidth?: boolean
  variant?: 'text' | 'outlined' | 'contained'
  component?: any
}

const TrailingButton: FunctionComponent<TrailingButtonProps> = ({
  className,
  onClick,
  disabled,
  fullWidth,
  variant,
  component,
  children,
}: PropsWithChildren<TrailingButtonProps>) => {
  const classes = useStyles({ fullWidth })
  return (
    <Button
      className={`${className} ${classes.trailingButton}`}
      color="primary"
      size="large"
      onClick={onClick}
      disabled={disabled}
      fullWidth={fullWidth}
      variant={variant}
      component={component}
    >
      {children}
    </Button>
  )
}

export default TrailingButton
