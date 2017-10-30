const configureMockStore = require('redux-mock-store').default;
const thunk = require('redux-thunk').default;
const nock = require('nock');
const expect = require('expect');

const {translators, initialState, cloneState, getNotificationAction} = require('../../_shared.js');

const actionsCreators = require('../../../../app/actions/admin/changeUserPassword');
const types = require('../../../../app/actions/_constants');
const reducer = require('../../../../app/reducers').default;

let middlewares = [thunk];
let mockStore = configureMockStore(middlewares);

describe('admin/changeUserPassword actions', () => {
  beforeEach(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('localhost');
    console.log = jest.fn();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should return the initial state', () => {
    expect(reducer()).toEqual(initialState);
  });

  describe('function setUserId', () => {

    const userId = translators[0].id;
    const action = {
      type: types.SET_ADMIN_USER_ID,
      id: userId
    };
    const state = { ...initialState,
      admin: { ...initialState.admin,
        editUserPassword: { ...initialState.admin.editUserPassword,
          id: userId
        }
      }
    };

    it('should work, reducer', () =>
      expect(reducer(initialState, action)).toEqual(state)
    );

    it('should work, action', () =>
      expect(actionsCreators.setUserId(userId)).toEqual(action)
    );
  });

  describe('function changeAdminUserPassword', () => {

    const {password, confirmPassword} = initialState.admin.editUserPassword;
    const startState = {...initialState,
      admin: {...initialState.admin,
        editUserPassword: {...initialState.admin.editUserPassword,
          id: translators[0].id
        }
      }
    };

    const testChangeAdminUserPassword = (input) => {

      const action = {
        type: types.CHANGE_ADMIN_USER_PASSWORD,
        password,
        confirmPassword,
        ...input
      };
      const state = { ...startState,
        admin: { ...startState.admin,
          editUserPassword: { ...startState.admin.editUserPassword,
            ...input
          }
        }
      };
      const store = mockStore(startState);

      it(`should change ${input}, reducer`, () => {
        expect(reducer(startState, action)).toEqual(state);
      });

      it(`should change ${input}, action`, () => {
        store.dispatch(actionsCreators.changeAdminUserPassword(input));
        expect(store.getActions().length).toEqual(1);
        expect(store.getActions()[0]).toEqual(action);
      });
    };

    testChangeAdminUserPassword({'password': 'new password value'});
    testChangeAdminUserPassword({'confirmPassword': 'new confirmPassword value'});
  });

  describe('function resetAdminUserPassword', () => {

    const expectedAction = {
      type: types.CHANGE_ADMIN_USER_PASSWORD,
      password: '',
      confirmPassword: ''
    };
    let _initialState = cloneState();
    Object.assign(_initialState.admin.editUserPassword, {
      password: 'password',
      confirmPassword: 'password'
    });

    it('should work, reducer', () =>
      expect(reducer(_initialState, expectedAction)).toEqual(initialState)
    );

    it('should work, action', () => {
      const store = mockStore(_initialState);
      store.dispatch(actionsCreators.resetAdminUserPassword());
      expect(store.getActions()[0]).toEqual(expectedAction);
    });
  });

  describe('function updateAdminUserPasswordAsync', () => {

    const userId = translators[0].id;
    const password = 'new_password';
    const confirmPassword = 'confirm_new_password';

    const responseSuccess = {
      success: true,
      user: translators[0]
    };
    const actions = [
      { type: types.UPDATE_ADMIN_USER_PASSWORD_START },
      {
        type: types.UPDATE_ADMIN_USER_PASSWORD_END,
        error: null
      },
      getNotificationAction('EditUserPassword.new_password_success', null)
    ];
    const states = [
      { ...initialState,
        admin: { ...initialState.admin,
          editUserPassword: { ...initialState.admin.editUserPassword,
            pending: true,
            id: userId,
            password,
            confirmPassword
          }
        }
      },
      { ...initialState,
        admin: { ...initialState.admin,
          editUserPassword: { ...initialState.admin.editUserPassword,
            id: userId,
            error: null
          }
        }
      }
    ];

    const responseFail = {
      error: true,
      code: 500,
      message: 'Can\'t update user data. Database error'
    };
    const actionsFail = [
      actions[0],
      {
        type: types.UPDATE_ADMIN_USER_PASSWORD_END,
        error: responseFail
      },
      getNotificationAction(null, responseFail)
    ];
    const statesFail = [
      states[0],
      { ...initialState,
        admin: { ...initialState.admin,
          editUserPassword: { ...initialState.admin.editUserPassword,
            id: userId,
            error: responseFail
          }
        }
      }
    ];

    const cloneStateBeforeRequest = () => {
      let _initialState = cloneState(states[0]);
      Object.assign(_initialState.admin.editUserPassword, { pending: false });
      return _initialState
    };

    it('should work, reducer', () => {
      const _initialState = cloneStateBeforeRequest();
      expect(reducer(_initialState, actions[0])).toEqual(states[0]);
      expect(reducer(_initialState, actions[1])).toEqual(states[1]);
    });

    it('should work, action', () => {
      const store = mockStore(cloneStateBeforeRequest());

      nock('http://localhost')
        .patch('/api/users/' + userId, {
          payload: {
            password: store.getState().admin.editUserPassword.password,
            confirmPassword: store.getState().admin.editUserPassword.confirmPassword
          }
        })
        .reply(200, responseSuccess);

      return store
        .dispatch(actionsCreators.updateAdminUserPasswordAsync())
        .then(() => expect(store.getActions()).toEqual(actions));
    });

    it('should handle error, reducer', () => {
      const _initialState = cloneStateBeforeRequest();
      expect(reducer(_initialState, actionsFail[0])).toEqual(statesFail[0]);
      expect(reducer(_initialState, actionsFail[1])).toEqual(statesFail[1]);
    });

    it('should handle error, action', () => {
      const store = mockStore(cloneStateBeforeRequest());

      nock('http://localhost')
        .patch('/api/users/' + userId, {
          payload: {
            password: store.getState().admin.editUserPassword.password,
            confirmPassword: store.getState().admin.editUserPassword.confirmPassword
          }
        })
        .reply(200, responseFail);

      return store
        .dispatch(actionsCreators.updateAdminUserPasswordAsync())
        .then(() => expect(store.getActions()).toEqual(actionsFail));
    });
  });
})
