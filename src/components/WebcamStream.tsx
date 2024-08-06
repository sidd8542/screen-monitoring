import React, { useRef } from 'react';
import Webcam from 'react-webcam';

const WebcamStream: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);

  return (
    <div>
      <Webcam 
        audio={true} 
        ref={webcamRef} 
        videoConstraints={{ 
          width: 1280, 
          height: 720, 
          facingMode: "user" 
        }} 
      />
    </div>
  );
};

export default WebcamStream;
