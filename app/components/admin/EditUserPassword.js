import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {FormattedMessage} from 'react-intl'

import {setUserId, changeAdminUserPassword, resetAdminUserPassword, updateAdminUserPasswordAsync} from '../../actions/admin/changeUserPassword'

class EditUserPassword extends Component {

  constructor(props) {
    super(props)
    this.sendNewUserData = this.sendNewUserData.bind(this)
    this.resetChanges = this.resetChanges.bind(this)
    this.changeUserPassword = this.changeUserPassword.bind(this)
    this.changeUserConfirmPassword = this.changeUserConfirmPassword.bind(this)
  }

  componentWillMount() {
    this.props.dispatch(setUserId(this.props.params.id))
  }

  changeUserPassword (event) {
    this.props.dispatch(changeAdminUserPassword({password: event.target.value}))
  }

  changeUserConfirmPassword (event) {
    this.props.dispatch(changeAdminUserPassword({confirmPassword: event.target.value}))
  }

  resetChanges (event) {
    event.preventDefault()
    this.props.dispatch(resetAdminUserPassword())
  }

  sendNewUserData (event) {
    event.preventDefault()
    this.props.dispatch(updateAdminUserPasswordAsync())
  }

  disabled () {
    const {pending, password, confirmPassword} = this.props.stateData
    if (pending) {
      return true;
    }
    if(!password || !confirmPassword || password !== confirmPassword) {
      return true;
    }
    if(password.length < 6) {
      return true;
    }
  }

  render () {
    const {id} = this.props.params
    const {password, confirmPassword} = this.props.stateData
    return (
      <div data-test-id="EditUserPassword">
        <form data-test-id="main-form" className="col-md-6">
          <h3 data-test-id="title"><FormattedMessage id="EditUserPassword.title" values={{id}} /></h3>
          <div data-test-id="group-new-pass" className="form-group">
            <label data-test-id="label-new-pass">
              <FormattedMessage id="EditUserPassword.new_password" />
              <span data-test-id="hint-new-pass" className="hint">
                <FormattedMessage id="EditUserPassword.new_password_hint" />
              </span>
            </label>
            <input data-test-id="input-new-pass"
              type="password"
              value={password}
              className="form-control"
              onChange={this.changeUserPassword}
            />
          </div>
          <div data-test-id="group-confirm-pass" className="form-group">
            <label data-test-id="label-confirm-pass">
              <FormattedMessage id="EditUserPassword.new_password_confirm" />
            </label>
            <input data-test-id="input-confirm-pass"
              type="password"
              value={confirmPassword}
              className="form-control"
              onChange={this.changeUserConfirmPassword}
            />
          </div>
          <div data-test-id="group-button" className="form-group">
            <button data-test-id="btn-save"
              className="btn btn-primary"
              onClick={this.sendNewUserData}
              disabled={this.disabled()}
              ><FormattedMessage id="Common.save" />
            </button>
            <button data-test-id="btn-reset"
              className="btn btn-default"
              onClick={this.resetChanges}
            ><FormattedMessage id="Common.reset" />
            </button>
            <Link data-test-id="btn-cancel" to={`/translator/${id}/edit`}>
              <FormattedMessage id="Common.cancel" />
            </Link>
          </div>
        </form>
      </div>
    )
  }
}

function select (state, ownProps) {
  return {
    stateData: state.admin.editUserPassword
  }
}

export default connect(select)(EditUserPassword)
