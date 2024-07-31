import { Action } from 'redux';

export const SET_SCREEN_STREAM = 'SET_SCREEN_STREAM';
export const CLEAR_SCREEN_STREAM = 'CLEAR_SCREEN_STREAM';

interface SetScreenStreamAction extends Action<typeof SET_SCREEN_STREAM> {
    payload: MediaStream;
}

interface ClearScreenStreamAction extends Action<typeof CLEAR_SCREEN_STREAM> {}

export type ScreenShareActionTypes = SetScreenStreamAction | ClearScreenStreamAction;

export const setScreenStream = (stream: MediaStream): SetScreenStreamAction => ({
    type: SET_SCREEN_STREAM,
    payload: stream,
});

export const clearScreenStream = (): ClearScreenStreamAction => ({
    type: CLEAR_SCREEN_STREAM,
});
