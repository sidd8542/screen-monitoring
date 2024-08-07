import { ScreenShareActionTypes, SET_SCREEN_STREAM, CLEAR_SCREEN_STREAM } from './actions';

interface ScreenShareState {
    screenStream: MediaStream | null;
}

const initialState: ScreenShareState = {
    screenStream: null,
};

const screenShareReducer = (state = initialState, action: ScreenShareActionTypes): ScreenShareState => {
    
    switch (action.type) {
        case SET_SCREEN_STREAM:
            return {
                ...state,
                screenStream: action.payload,
            };
        case CLEAR_SCREEN_STREAM:
            if (state.screenStream) {
                state.screenStream.getTracks().forEach(track => track.stop());
            }
            return {
                ...state,
                screenStream: null,
            };
        default:
            return state;
    }
};

export default screenShareReducer;
