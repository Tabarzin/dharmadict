import asyncRequest from '../../helpers/remote'
import notifier from '../../helpers/notifier'

import {
  GET_ADMIN_USER_DATA_START,
  GET_ADMIN_USER_DATA_END,
  UPDATE_ADMIN_USER_DATA_START,
  UPDATE_ADMIN_USER_DATA_END,
  CHANGE_ADMIN_USER_DATA
} from '../_constants'

export const getEditableUserDataObject = (user) => ({
  name: user.name,
  language: user.language
})

export function getAdminUserDataAsync(userId) {
  return (dispatch, getState) => {
    const query = 'users/' + userId
    dispatch({
      type: GET_ADMIN_USER_DATA_START
    })
    const {id, dataSource} = getState().admin.editUser
    return asyncRequest(query, 'get', false, (data, error) => {
      dispatch({
        type: GET_ADMIN_USER_DATA_END,
        error: error ? error : null,
        data: error ? dataSource : getEditableUserDataObject(data.user),
        id: error ? id : data.user.id
      })
      error && dispatch(notifier.onErrorResponse(error))
    })
  }
}

export function changeAdminUserData(_data) {
  return (dispatch, getState) => {
    const {data} = getState().admin.editUser
    const payload = {
      name: _data.hasOwnProperty('name') ? _data.name : data.name,
      language: _data.hasOwnProperty('language') ? _data.language : data.language
    }
    dispatch({
      type: CHANGE_ADMIN_USER_DATA,
      payload
    })
  }
}

export function updateAdminUserDataAsync() {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_ADMIN_USER_DATA_START
    })
    const {id, data, dataSource} = getState().admin.editUser
    const query = 'users/' + id
    return asyncRequest(query, 'patch', {payload: data}, (data, error) => {
      dispatch({
        type: UPDATE_ADMIN_USER_DATA_END,
        error: error ? error : null,
        data: error ? dataSource : getEditableUserDataObject(data.user)
      })
      dispatch(notifier.onResponse('EditUser.success', error))
    })
  }
}

export function resetAdminUserData() {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_ADMIN_USER_DATA,
      payload: getState().admin.editUser.dataSource
    })
  }
}
