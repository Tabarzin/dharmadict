import asyncRequest from '../helpers/remote'
import notifier from '../helpers/notifier'
import { goBack } from './route'

import {
  TRANSLATION_REQUEST_START,
  TRANSLATION_REQUEST_END,
  CHANGE_TRANSLATION_LOCAL,
  TRANSLATION_UPDATE_START,
  TRANSLATION_UPDATE_END
} from './_constants'

export function getTranslationCopy(translation) {
  let translationCopy = translation ? JSON.parse(JSON.stringify(translation)) : null
  if (translationCopy) {
    translationCopy.meanings.forEach(m => {
      m.versions.push('')
      delete m.versions_lower
    })
  }
  return translationCopy
}

function dispatchTranslationRequestEnd(dispatch, translatorId, translation, termId, termName, error) {
  if (!translation) {
    translation = {
      meanings: [],
      translatorId
    }
  }
  error && dispatch(notifier.onErrorResponse(error))
  return dispatch({
    type: TRANSLATION_REQUEST_END,
    termId,
    termName,
    translation,
    translationCopy: getTranslationCopy(translation),
    error
  })
}

export function selectTranslation(translatorId, termId) {
  return (dispatch, getState) => {
    let term = getState().selected.term
    if (term) { // sync translation select
      let error = term.id !== termId ? {
        message: 'Invalid term.'
      } : null;
      let translation = !error ? term.translations.find(t => t.translatorId === translatorId) : null
      dispatchTranslationRequestEnd(dispatch, translatorId, translation, termId, term.wylie, error)
    } else { // async translation request
      dispatch({
        type: TRANSLATION_REQUEST_START
      })
      console.log('Let\'s start an async translation request to db! The term is "' + termId + '".')
      return asyncRequest(`terms/translation?translatorId=${translatorId}&termId=${termId}`, 'get', null, (data, error) => {
        let translation = data ? data.result.translation : null
        dispatchTranslationRequestEnd(dispatch, translatorId, translation, data ? data.result.termId : '', data ? data.result.termName : '', error)
      })
    }
  }
}

export function onVersionChanged(meaningIndex, versionIndex, value) {
  return (dispatch, getState) => {
    let translation = getState().edit.change
    let meaning = translation.meanings[meaningIndex]
    meaning.versions[versionIndex] = value
    if (versionIndex === meaning.versions.length - 1) {
      meaning.versions.push('')
    }
    return dispatch({
      type: CHANGE_TRANSLATION_LOCAL,
      change: translation
    })
  }
}

export function onVersionRemoved(meaningIndex, versionIndex) {
  return (dispatch, getState) => {
    let translation = getState().edit.change
    let meaning = translation.meanings[meaningIndex]
    meaning.versions.splice(versionIndex, 1)
    return dispatch({
      type: CHANGE_TRANSLATION_LOCAL,
      change: translation
    })
  }
}

export function onCommentChanged(meaningIndex, value) {
  return (dispatch, getState) => {
    let translation = getState().edit.change
    let meaning = translation.meanings[meaningIndex]
    meaning.comment = value
    return dispatch({
      type: CHANGE_TRANSLATION_LOCAL,
      change: translation
    })
  }
}

export function onMeaningRemoved(meaningIndex) {
  return (dispatch, getState) => {
    let translation = getState().edit.change
    translation.meanings.splice(meaningIndex, 1)
    return dispatch({
      type: CHANGE_TRANSLATION_LOCAL,
      change: translation
    })
  }
}

export function addNewMeaning() {
  return (dispatch, getState) => {
    let translation = getState().edit.change
    translation.meanings.push({
      comment: null,
      versions: [""]
    })
    return dispatch({
      type: CHANGE_TRANSLATION_LOCAL,
      change: translation
    })
  }
}

export function resetTranslation() {
  return (dispatch, getState) => {
    let editState = getState().edit
    return dispatch({
      type: CHANGE_TRANSLATION_LOCAL,
      change: getTranslationCopy(editState.source)
    })
  }
}

export function saveTranslationAsync(shouldClose) {
  return (dispatch, getState) => {
    let editState = getState().edit
    let termId = editState.termId
    let translation = getTranslationCopy(editState.change)
    translation.meanings.forEach(m => m.versions = m.versions.filter(v => v))
    translation.meanings = translation.meanings.filter(m => m.versions.length)
    dispatch({
      type: TRANSLATION_UPDATE_START
    })
    console.log('Let\'s start an async update translation request to db! The term is "' + termId + '".')
    return asyncRequest(`terms`, 'patch', {
      termId: termId,
      translation
    }, (data, error) => {
      dispatch({
        type: TRANSLATION_UPDATE_END,
        error: error,
        searchResult: !error ? getState().search.result.map(r => r.id === data.term.id ? data.term : r) : null,
        term: error ? null : {...getState().selected.term,
          translations: getState().selected.term.translations.map(elem => {
            if (elem.translatorId === data.term.translation.translatorId) {
              return data.term.translation
            } else {
              return elem
            }
          })
        }
      })
      error && dispatch(notifier.onErrorResponse(error))
      if(shouldClose && process.env.NODE_ENV !== 'test') {
        dispatch(goBack(true))
      }
    })
  }
}
