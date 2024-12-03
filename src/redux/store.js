import {createStore} from 'redux';
import rootReducer from './rootReducer';
import thunk from 'redux-thunk'
const store=createStore(rootReducer);

export default store;