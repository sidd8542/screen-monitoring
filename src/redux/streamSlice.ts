// streamSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StreamState {
    stream: MediaStream | null;
}

const initialState: StreamState = {
    stream: null,
};

const streamSlice = createSlice({
    name: 'stream',
    initialState,
    reducers: {
        setStream(state, action: PayloadAction<MediaStream | null>) {
            state.stream = action.payload;
        },
    },
});

export const { setStream } = streamSlice.actions;
export default streamSlice.reducer;
