import { configureStore } from '@reduxjs/toolkit';
import streamReducer from './streamSlice';

const store:any = configureStore({
    reducer: {
        stream: streamReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
