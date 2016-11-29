import React, {Component} from 'react'
import {connect} from 'react-redux'
import SearchInput from './search/SearchInput'
import ResultList from './search/ResultList'

import {doSearchRequestAsync} from '../actions'

class Search extends Component {
  constructor (props) {
    super(props)
    this._search = this._search.bind(this)
  }

  render () {
    let searchString = this.props.data.searchString
    return (
      <div>
        <SearchInput onSubmit={this._search} />
        <ResultList />
      </div>
    )
  }

  _search (searchString) {
    console.log('Let\'s start an async request to db! searchString is "' + searchString + '"')
    this.props.dispatch(doSearchRequestAsync(searchString))
  }
}

Search.propTypes = {
  data: React.PropTypes.object,
  dispatch: React.PropTypes.func
}

function select (state) {
  return {
    data: state.searchState
  }
}

export default connect(select)(Search)
