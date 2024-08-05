// ScreenRecordComponent.tsx
import React, { useState, useRef } from "react";

interface ScreenRecordProps {
  socket: WebSocket;
  sessionId: string;
}

const ScreenRecordComponent: React.FC<ScreenRecordProps> = ({ socket, sessionId }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks: Blob[] = [];

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      chunks.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      socket.send(JSON.stringify({ sessionId, type: "screen", blob }));
    };
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current!.stop();
    setRecording(false);
  };

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      {videoUrl && (
        <video src={videoUrl} controls />
      )}
    </div>
  );
};

export default ScreenRecordComponent;
