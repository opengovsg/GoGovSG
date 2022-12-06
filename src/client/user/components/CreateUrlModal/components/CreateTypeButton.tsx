import React, { ComponentType, FunctionComponent } from 'react'
import { Button, Typography, useTheme } from '@material-ui/core'

type IconProps = any
type CreateTypeButtonProps = {
  InputProps: any
  Icon: ComponentType<IconProps>
  isEnabled: boolean
  onChange: () => void
  children: string
}

const CreateTypeButton: FunctionComponent<CreateTypeButtonProps> = ({
  InputProps,
  Icon,
  isEnabled,
  onChange,
  children,
}: CreateTypeButtonProps) => {
  const { classes } = InputProps
  const theme = useTheme()
  return (
    <Button
      variant={isEnabled ? 'text' : 'contained'}
      className={`${classes.linkTypeButton} ${
        isEnabled ? '' : classes.linkTypeButtonEnabled
      }`}
      onClick={onChange}
    >
      <Icon
        color={
          isEnabled
            ? theme.palette.primary.dark
            : theme.palette.background.default
        }
      />
      <Typography variant="body2" className={classes.linkTypeButtonText}>
        {children}
      </Typography>
    </Button>
  )
}

export default CreateTypeButton
