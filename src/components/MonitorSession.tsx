// MonitorRoute.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const MonitorSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [formData, setFormData] = useState<any>({});
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8080');
    const currentSocket = socketRef.current;

    currentSocket.onopen = () => {
      console.log('WebSocket connection opened.');
      if (sessionId) {
        currentSocket.send(JSON.stringify({ type: 'join', sessionId }));
      }
    };

    currentSocket.onmessage = (message) => {
      console.log('Received message:', message.data);
      const data = JSON.parse(message.data);
      if (data.type === 'updateForm') {
        setFormData(data.formData);
      }
    };

    currentSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (currentSocket) currentSocket.close();
    };
  }, [sessionId]);

  return (
    <div>
      <h2>Monitoring Session: {sessionId}</h2>
      <form>
        <input
          type="text"
          value={formData.name || ''}
          readOnly
        />
        {/* Display other form fields as needed */}
      </form>
    </div>
  );
};

export default MonitorSession;
