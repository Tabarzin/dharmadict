import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {FormattedMessage} from 'react-intl'

import lang from '../helpers/lang'
import {getTranslatorInfoAsync} from '../actions/translators'

class TranslatorPage extends Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.getTranslatorInfo(this.props.params.id)
  }

  componentWillReceiveProps (nextProps) {
    if(nextProps.params.id !== this.props.params.id) {
      this.getTranslatorInfo(nextProps.params.id)
    }
  }

  getTranslatorInfo(id) {
    this.props.dispatch(getTranslatorInfoAsync(id))
  }

  getTranslatorContent (translatorInfo) {
    const translator = translatorInfo.translator
    const bioPages = translatorInfo.pages.filter(e => e.bio)
    const defaultPages = translatorInfo.pages.filter(e => !e.bio)
    const translatorId = this.props.params.id // translator.id ??
    const userData = this.props.userInfo.data
    const {languages, userLanguage} = this.props.common
    const translatorLang = languages && languages.find(elem => elem.id === translator.language)
    return (
      <div data-test-id="translatorContent">
        <h3 data-test-id="name">{translator.name}</h3>

        <h4><FormattedMessage id="TranslatorPage.translations_language" /></h4>
        <h5>
          <ul>
            <li>
              {
                translatorLang ?
                  translatorLang['name_' + lang.get(userLanguage)] :
                  <FormattedMessage id="TranslatorPage.no_info" />
              }
            </li>
          </ul>
        </h5>

        <h4><FormattedMessage id="TranslatorPage.translator_biography_title" /></h4>
        {
          !bioPages.length ? (
            <h5>
              <ul>
                <li><FormattedMessage id="TranslatorPage.no_info" /></li>
              </ul>
            </h5>
          ) : (
            <ul data-test-id="listOfBioPages">
              {bioPages.map((page, i) =>
                <li key={i}><Link to={`/pages/${page.url}`}>{page.title}</Link></li>
              )}
            </ul>
          )
        }
        <h4>
          <FormattedMessage id="TranslatorPage.articles_of_translator" />
        </h4>
        {
          !defaultPages.length ? (
            <h5>
              <ul>
                <li><FormattedMessage id="TranslatorPage.no_info" /></li>
              </ul>
            </h5>
          ) : (
            <ul data-test-id="listOfDefaultPages">
              {
                defaultPages.map((page, i) =>
                  <li key={i}><Link to={`/pages/${page.url}`}>{page.title}</Link></li>
                )
              }
            </ul>
          )
        }
        {
          userData && userData.role === 'admin' &&
          <div>
            <br />
            <Link data-test-id="changeUser" className="btn btn-default" to={`/translator/${translatorId}/edit`}>
              <FormattedMessage id="TranslatorPage.button_edit" />
            </Link>
          </div>
        }
        {
          userData && userData.role === 'translator' && userData.id === translatorId &&
          <Link data-test-id="changeTranslatorPassword"
            to={`/translator/${translatorId}/password`}
            className="btn btn-default">
            <FormattedMessage id="TranslatorPage.button_edit_password" />
          </Link>
        }
      </div>
    )
  }

  render () {
    const {translatorInfo} = this.props
    let content = translatorInfo.pending ? (
      <h3 data-test-id="pending">
        <FormattedMessage id="TranslatorPage.loading_text" />
      </h3>
    ) : (
      translatorInfo.error ? (
        <h3 data-test-id="error">{translatorInfo.error.message}</h3>
      ) :
        this.getTranslatorContent(translatorInfo)
    )
    return (
      <div data-test-id="TranslatorPage">{content}</div>
    )
  }
}

function select (state) {
  return {
    translatorInfo: state.translatorInfo,
    userInfo: state.auth.userInfo,
    common: state.common
  }
}

export default connect(select)(TranslatorPage)
