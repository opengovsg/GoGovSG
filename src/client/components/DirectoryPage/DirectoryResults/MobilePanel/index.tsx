import React, { FunctionComponent } from 'react'
import copy from 'copy-to-clipboard'
import { useDispatch } from 'react-redux'
import {  
    Typography,
    makeStyles,
    createStyles,
    Drawer,
    Paper,
    Divider,
} from '@material-ui/core'
import { SetSuccessMessageAction } from '../../../../actions/root/types'
import rootActions from '../../../../actions/root'
import useAppMargins from '../../../AppMargins/appMargins'
import { UrlTypePublic } from '../../../../reducers/search/types'
import personIcon from '../../assets/person-icon.svg'
import copyEmailIcon from '../../assets/copy-email-icon.svg'
import RedirectIcon from '../../widgets/RedirectIcon'
import DirectoryFileIcon from '../../widgets/DirectoryFileIcon'
import DirectoryUrlIcon from '../../widgets/DirectoryUrlIcon'

type MobilePanelProps = {
    isOpen: boolean
    setOpen: (open: boolean) => void
    url: UrlTypePublic
}

const useStyles = makeStyles((theme) =>
  createStyles({
    mobilePanel: {
      padding: theme.spacing(1.5),
    },
    personIcon: {
        marginRight: 5,
    },
    copyIcon: {
        position: 'absolute',
        right: '10%'
    },
    goToIcon:{
        position: 'absolute',
        right: '10%'
    },
    row: {
        padding: theme.spacing(3),
    },
    divider: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
    },
    shortUrlRow: {
        display: 'inline-block',
        maxWidth: '200px',
        width: '100%',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    shortUrlInActive: {
        color: "#BBBBBB"
    },
    stateIcon: {
        verticalAlign: 'middle'
    },
    stateActive: {
        color: '#6d9067',
        textTransform: 'capitalize',
        padding: theme.spacing(3),
      },
      stateInactive: {
        color: '#c85151',
        textTransform: 'capitalize',
        padding: theme.spacing(3),
      },
  }),
)

const MobilePanel: FunctionComponent<MobilePanelProps> = ({
    isOpen,
    setOpen,
    url,
}: MobilePanelProps) => {
    const appMargins = useAppMargins()
    const classes = useStyles({ appMargins })
    const dispatch = useDispatch()

    const onClickEvent = () => {
        copy(url.email)
        dispatch<SetSuccessMessageAction>(
            rootActions.setSuccessMessage('Email has been copied'),
        )
      }

    // inactive and active icons/ colors
    const getMobileIcon = () => {
        if (url?.state === 'ACTIVE' && url?.isFile) {
            return (<>
                        <DirectoryFileIcon className={classes.stateIcon}/>
                        <span>/{url?.shortUrl}</span>
                    </>)
        }
        else if (url?.state === 'ACTIVE' && !url?.isFile) {
            return (<>
                        <DirectoryUrlIcon className={classes.stateIcon}/>
                        <span>/{url?.shortUrl}</span>
                    </>)
        }
        else if (url?.isFile) {
            return (<>
                        <DirectoryFileIcon className={classes.stateIcon} color={'#BBBBBB'}/>
                        <span className={classes.shortUrlInActive}>/{url?.shortUrl}</span>
                    </>)
        }
        else {
            return (<>
                        <DirectoryUrlIcon className={classes.stateIcon} color={'#BBBBBB'}/>
                        <span className={classes.shortUrlInActive}>/{url?.shortUrl}</span>
                    </>)
        }
    }
    
    return(
    <Drawer
        anchor='bottom'
        open={isOpen}
        onBackdropClick={() => setOpen(false)}
        onEscapeKeyDown={() => setOpen(false)}
        >
        <Paper className={classes.mobilePanel}>
        <Typography className={classes.row}
            variant='body2'>
            <div className={classes.shortUrlRow}>
                {getMobileIcon()}
                {url?.state === 'ACTIVE' &&
                    <a href={url?.shortUrl} target='_blank' rel="noopener noreferrer">
                        <RedirectIcon className={classes.goToIcon}/>
                    </a>
                }
            </div>
        </Typography>
        <Typography 
            variant="caption"
            className={
            url?.state === 'ACTIVE'
                ? classes.stateActive
                : classes.stateInactive
            }
        >
            <b style={{ fontWeight: 900 }}>{'• '}</b>
            {url?.state.toLowerCase()}
        </Typography>
        <Divider className={classes.divider}/>
        <Typography className={classes.row}
            variant='body2'>
            <img
                className={classes.personIcon}
                src={personIcon}
            />
            {url?.email}
            <img 
                className={classes.copyIcon}
                src={copyEmailIcon}
                onClick={()=> onClickEvent()}
            />
        </Typography>
        </Paper>
    </Drawer>
    )
}

export default MobilePanel