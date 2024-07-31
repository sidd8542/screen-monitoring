export interface ScreenShareState {
    screenStream: MediaStream | null;
}

export interface AppState {
    screenShare: ScreenShareState;
}
