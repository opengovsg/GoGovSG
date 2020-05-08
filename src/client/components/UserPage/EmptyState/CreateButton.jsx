import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, createStyles, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import userActions from '../../../actions/user'

const mapDispatchToProps = (dispatch) => ({
  openCreateUrlModal: () => {
    dispatch(userActions.openCreateUrlModal())
  },
})

const useState = makeStyles((theme) =>
  createStyles({
    createButton: {
      width: '180px',
      minWidth: '140px',
      marginTop: theme.spacing(4),
    },
  }),
)

const CreateButton = ({ className, openCreateUrlModal }) => {
  const classes = useState()
  return (
    <Button
      size="large"
      color="primary"
      variant="contained"
      onClick={() => openCreateUrlModal()}
      className={classNames(className, classes.createButton)}
    >
      Create link
    </Button>
  )
}

CreateButton.propTypes = {
  className: PropTypes.string,
  openCreateUrlModal: PropTypes.func.isRequired,
}

CreateButton.defaultProps = {
  className: undefined,
}

export default connect(null, mapDispatchToProps)(CreateButton)
