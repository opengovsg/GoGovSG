import React, { FunctionComponent, useState } from 'react'
import {
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import { ApplyAppMargins } from '../../../app/components/AppMargins'
import DirectoryTable from './DirectoryTable'
import { UrlTypePublic } from '../../reducers/types'
import useAppMargins from '../../../app/components/AppMargins/appMargins'
import MobilePanel from './MobilePanel'

type DirectoryResultsProps = {
  searchResults: Array<UrlTypePublic>
  pageCount: number
  rowsPerPage: number
  changePageHandler: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    pageNumber: number,
  ) => void
  changeRowsPerPageHandler: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  currentPage: number
  resultsCount: number
  query: string
  disablePagination: boolean
}

const useStyles = makeStyles((theme) =>
  createStyles({
    resultsHeaderText: {
      marginTop: theme.spacing(7.25),
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(11),
      },
    },
    tableWrapper: {
      width: '100%',
      margin: '0 auto',
      minHeight: theme.spacing(40),
      [theme.breakpoints.up(1440)]: {
        width: theme.spacing(180),
      },
    },
    mobilePanel: {
      padding: theme.spacing(1.5),
  },
  }),
)

const DirectoryResults: FunctionComponent<DirectoryResultsProps> = ({
  searchResults,
  pageCount,
  rowsPerPage,
  resultsCount,
  currentPage,
  changePageHandler,
  changeRowsPerPageHandler,
  query,
  disablePagination,
}: DirectoryResultsProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState<boolean>(false)
  const [urlInfo, setUrlInfo] = useState<UrlTypePublic>()

  return (
    <div className={classes.tableWrapper}>
      <ApplyAppMargins>
        <Typography
          variant={isMobileView ? 'h5' : 'h3'}
          className={classes.resultsHeaderText}
        >
          {!!resultsCount &&
            `Showing ${resultsCount} link${
              resultsCount > 1 ? 's' : ''
            } for “${query}”`}
          {!resultsCount && `No links found for “${query}”`}
        </Typography>
      </ApplyAppMargins>
      {!!resultsCount && (
        <DirectoryTable
          searchResults={searchResults}
          pageCount={pageCount}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          changePageHandler={changePageHandler}
          changeRowsPerPageHandler={changeRowsPerPageHandler}
          resultsCount={resultsCount}
          setUrlInfo={setUrlInfo}
          setOpen={setIsMobilePanelOpen}
          disablePagination={disablePagination}
        />
      )}

        <MobilePanel 
          isOpen={isMobilePanelOpen}
          setOpen={setIsMobilePanelOpen}
          url={urlInfo as UrlTypePublic}/>
    </div>
  )
}

export default DirectoryResults
