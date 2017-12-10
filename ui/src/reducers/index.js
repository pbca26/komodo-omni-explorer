import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
// import { Dashboard } from './dashboard';

const appReducer = combineReducers({
  routing: routerReducer,
});

const initialState = appReducer({}, {});
const rootReducer = (state, action) => {
  return appReducer(state, action);
}

export default rootReducer;
