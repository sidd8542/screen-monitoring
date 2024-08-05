// ScreenStreamComponent.tsx
import React, { useState, useRef } from "react";

interface ScreenStreamProps {
  socket: WebSocket;
  sessionId: string;
}

const ScreenStreamComponent: React.FC<ScreenStreamProps> = ({ socket, sessionId }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startStreaming = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    videoRef.current!.srcObject = stream;
    socket.send(JSON.stringify({ sessionId, type: "stream", stream }));
  };

  return (
    <div>
      <video ref={videoRef} autoPlay />
      <button onClick={startStreaming}>Start Streaming</button>
    </div>
  );
};

export default ScreenStreamComponent;
