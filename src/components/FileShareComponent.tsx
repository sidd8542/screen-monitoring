// FileShareComponent.tsx
import React, { useState } from "react";

interface FileShareProps {
  socket: WebSocket;
  sessionId: string;
}

const FileShareComponent: React.FC<FileShareProps> = ({ socket, sessionId }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const sendFile = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result;
        socket.send(JSON.stringify({ sessionId, type: "file", data, fileName: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={sendFile}>Send File</button>
    </div>
  );
};

export default FileShareComponent;
