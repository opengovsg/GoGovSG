import React, { FunctionComponent, PropsWithChildren } from 'react'
import {
  Collapse,
  IconButton,
  Paper,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from './CloseIcon'

type CollapsingPanelProps = {
  isOpen: boolean
  onClose?: () => void
  className?: string
}

const useStyles = makeStyles((theme) =>
  createStyles({
    collapse: {
      position: 'absolute',
      left: 0,
      top: 'calc(100% + 10px)',
      zIndex: 1000,
      [theme.breakpoints.down('sm')]: {
        top: 0,
        height: '100% !important', // Bypass Material UI uses element style
        minHeight: '800px !important',
      },
    },
    collapseWrapper: {
      [theme.breakpoints.down('sm')]: {
        height: '100%',
      },
    },
    closeIcon: {
      position: 'absolute',
      top: 0,
      right: 0,
      margin: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        margin: theme.spacing(3),
      },
    },
    root: {
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      border: 'solid 1px #e8e8e8',
      height: '100%',
      overflow: 'hidden',
    },
  }),
)

const CollapsingPanel: FunctionComponent<CollapsingPanelProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
}: PropsWithChildren<CollapsingPanelProps>) => {
  const classes = useStyles()
  return (
    <Collapse
      in={isOpen}
      className={`${className} ${classes.collapse}`}
      classes={{ wrapper: classes.collapseWrapper }}
      timeout={100}
    >
      <Paper className={classes.root}>
        {onClose && (
          <IconButton className={classes.closeIcon} onClick={onClose}>
            <CloseIcon size={20} />
          </IconButton>
        )}
        {children}
      </Paper>
    </Collapse>
  )
}

export default CollapsingPanel
