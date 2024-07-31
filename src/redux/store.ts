import { createStore, combineReducers } from 'redux';
import screenShareReducer from './screenShareReducer';

const rootReducer = combineReducers({
    screenShare: screenShareReducer,
});

const store = createStore(rootReducer);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
