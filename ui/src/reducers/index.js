import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { Main } from './main';

const appReducer = combineReducers({
  Main,
  routing: routerReducer,
});

const initialState = appReducer({}, {});
const rootReducer = (state, action) => {
  return appReducer(state, action);
}

export default rootReducer;
