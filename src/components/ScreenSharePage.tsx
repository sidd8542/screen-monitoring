import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setScreenStream, clearScreenStream } from '../redux/actions';
import { AppDispatch, RootState } from '../redux/store';

const ScreenSharePage: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const screenStream = useSelector((state: RootState) => state.screenShare.screenStream);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Function to request screen sharing
    const requestScreenSharing = async () => {
        try {
            // Attempt to get display media
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            dispatch(setScreenStream(stream));
            console.log('Screen sharing started:', stream);
            setIsSharing(true);
            setError(null);

            const screenTrack = stream.getTracks()[0];
            screenTrack.onended = () => {
                dispatch(clearScreenStream());
                setIsSharing(false);
                console.log('Screen sharing ended');
            };
        } catch (error) {
            console.error('Error sharing screen:', error);
            setError('Failed to start screen sharing. Please ensure your browser supports it and you have granted the necessary permissions.');
            setIsSharing(false);
        }
    };

    const handleShareScreen = () => {
        if (isSharing) {
            return;
        }
        requestScreenSharing();
    };

    const stopScreenShare = () => {
        dispatch(clearScreenStream());
        setIsSharing(false);
    };

    useEffect(() => {
        if (videoRef.current && screenStream) {
            videoRef.current.srcObject = screenStream;
        }
    }, [screenStream]);

    return (
        <div>
            <h1>Screen Share</h1>
            <button onClick={handleShareScreen} disabled={isSharing}>
                {isSharing ? 'Sharing Screen...' : 'Share Screen'}
            </button>
            <button onClick={stopScreenShare} disabled={!screenStream}>
                Stop Sharing
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {screenStream && (
                <div>
                    <h2>Shared Screen</h2>
                    <video autoPlay ref={videoRef} style={{ width: '100%', height: 'auto' }} />
                </div>
            )}
        </div>
    );
};

export default ScreenSharePage;
