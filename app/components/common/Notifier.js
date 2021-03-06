import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {FormattedMessage} from 'react-intl'
import {Alert} from 'react-bootstrap'

import {removeNotify} from '../../actions/notifier'

class Notifier extends Component {

  constructor(props) {
    super(props)
    this.closeAlert = this.closeAlert.bind(this)
  }

  closeAlert (id) {
    this.props.dispatch(removeNotify(id, true))
  }

  render () {
    const {notifications} = this.props
    return (
      <div data-test-id="Notifier" className="alert-column">
        {notifications.length !== 0 && notifications.map((elem, index) =>
          <Alert data-test-id="Notifier.notification"
            onDismiss={() => this.closeAlert(elem.id)}
            bsStyle={elem.type}
            key={index}>
            <span data-test-id="Notifier.message">
              <FormattedMessage id={elem.text} values={elem.values} />
            </span>
          </Alert>
        )}
      </div>
    )
  }
}

function select (state) {
  return {
    notifications: state.notifications.list
  }
}

Notifier.propTypes = {
  notifications: PropTypes.array
}

export default connect(select)(Notifier)
