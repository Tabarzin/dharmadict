import asyncRequest from '../../helpers/remote'

import {
  CHANGE_ADMIN_USER_DATA_START,
  CHANGE_ADMIN_USER_DATA_END,
  GET_ADMIN_USER_DATA_START,
  GET_ADMIN_USER_DATA_END,
  UPDATE_ADMIN_USER_DATA
} from '../_constants'

export function getAdminUserDataAsync(userId) {
  return (dispatch) => {
    const query = 'users/' + userId
    dispatch({
      type: GET_ADMIN_USER_DATA_START
    })
    asyncRequest(query, false, (data, error) =>
      dispatch({
        type: GET_ADMIN_USER_DATA_END,
        error: error ? error : null,
        result: !error ? data.user : null
      })
    )
  }
}

export function changeAdminUserDataAsync() {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_ADMIN_USER_DATA_START
    })
    const userId = getState().admin.editUser.id
    const payload = {
      name: getState().admin.editUser.data.name,
      language: getState().admin.editUser.data.language,
      description: getState().admin.editUser.data.description
    }
    return asyncRequest('updateUser', {userId, payload}, (data, error) =>
      dispatch({
        type: CHANGE_ADMIN_USER_DATA_END,
        result: !error ? data : null,
        error: error ? error : null
      }))
  }
}

export function updateAdminUserData(_data) {
  return (dispatch, getState) => {
    const {data} = getState().admin.editUser
    const payload = {
      name: _data.hasOwnProperty('name') ? _data.name : data.name,
      language: _data.hasOwnProperty('language') ? _data.language : data.language,
      description: _data.hasOwnProperty('description') ? _data.description : data.description
    }
    dispatch({
      type: UPDATE_ADMIN_USER_DATA,
      payload
    })
  }
}

export function resetAdminUserData() {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_ADMIN_USER_DATA,
      payload: getState().admin.editUser.dataSource
    })
  }
}
