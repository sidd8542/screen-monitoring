import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const ConsumeScreenPage: React.FC = () => {
    const screenStream = useSelector((state: RootState) => state.screenShare.screenStream);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoRef.current && screenStream) {
            videoRef.current.srcObject = screenStream;
        }
    }, [screenStream]);

    return (
        <div>
            <h1>Consume Screen Share</h1>
            {screenStream ? (
                <video autoPlay ref={videoRef} style={{ width: '800px', height: '600px' }} />
            ) : (
                <p>No screen is being shared currently.</p>
            )}
        </div>
    );
};

export default ConsumeScreenPage;
