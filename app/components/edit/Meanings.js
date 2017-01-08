import React, {Component} from 'react'
import {connect} from 'react-redux'

import EditControls from './EditControls'

import {onVersionChanged, onVersionRemoved, onCommentChanged, onMeaningRemoved, addNewMeaning} from '../../actions/edit'

class Meanings extends Component {
  constructor (props) {
    super(props)
    this._onVersionChanged = this._onVersionChanged.bind(this)
    this._onVersionRemoved = this._onVersionRemoved.bind(this)
    this._onCommentChanged = this._onCommentChanged.bind(this)
    this._onMeaningRemoved = this._onMeaningRemoved.bind(this)
    this._addNewMeaning = this._addNewMeaning.bind(this)
  }

  render () {
    return (
      <div>
        <h2>{this.props.data.termName}</h2>
        <ul className="meaningList">
        {
          this.props.data.change.meanings.map((meaning, meaningIndex) =>
          <li key={meaningIndex}>
            <div className="meaning">
              <div className="title">
                Значение {meaningIndex + 1}
              </div>
              <ul className="versionList">
              {
                meaning.versions.map((version, versionIndex) =>
                  <li key={versionIndex} className="form-group form-inline">
                    <input className="form-control" name="search" type="text"
                      value={version}
                      onChange={(event) => this._onVersionChanged(event, meaningIndex, versionIndex)}/>
                      <button className="btn btn-link btn-sm remove-btn" type="button"
                        disabled={versionIndex === meaning.versions.length - 1 ? "disabled" : ""}
                        onClick={() => this._onVersionRemoved(meaningIndex, versionIndex)}>X
                      </button>
                  </li>
                )
              }
              </ul>
            </div>
            <div className="comment">
              <span className="title">Комментарий к значению {meaningIndex + 1}</span>
              <div className="form-group form-inline">
                <textarea className="form-control" name="comment"
                  value={meaning.comment || ''}
                  onChange={(event) => this._onCommentChanged(event, meaningIndex)}/>
              </div>
            </div>
            <div className="remove">
              <a className="remove-link"
                onClick={(event) => this._onMeaningRemoved(event, meaningIndex)}>
                Удалить значение {meaningIndex + 1}
              </a>
            </div>
          </li>
          )
        }
          <li>
            {
              !this.props.data.change.meanings.length ? (
                <div className="no-meanings">
                  Нет ни одного значения
                </div>
              ) : ( null )
            }
            <a className="add-new-meaning" onClick={this._addNewMeaning}>
              Добавить новое значение
            </a>
          </li>
        </ul>

        <EditControls/>

      </div>
    )
  }

  _onVersionChanged (event, meaningIndex, versionIndex) {
    this.props.dispatch(onVersionChanged(meaningIndex, versionIndex, event.target.value))
  }

  _onVersionRemoved (meaningIndex, versionIndex) {
    this.props.dispatch(onVersionRemoved(meaningIndex, versionIndex))
  }

  _onCommentChanged (event, meaningIndex) {
    this.props.dispatch(onCommentChanged(meaningIndex, event.target.value))
  }

  _onMeaningRemoved (event, meaningIndex) {
    event.preventDefault()
    this.props.dispatch(onMeaningRemoved(meaningIndex))
  }

  _addNewMeaning (event) {
    event.preventDefault()
    this.props.dispatch(addNewMeaning())
  }
}

function select (state) {
  return {
    data: state.edit
  }
}

export default connect(select)(Meanings)