// FormRoute.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimplePeer from 'simple-peer';

const CreateSession: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const socketRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();

  // Initialize WebSocket connection and handle messages
  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8080');
    const currentSocket = socketRef.current;

    currentSocket.onopen = () => {
      console.log('WebSocket connection opened.');
    };

    currentSocket.onmessage = (message) => {
      console.log('Received message:', message.data);
      const data = JSON.parse(message.data);
      if (data.type === 'sessionId') {
        setSessionId(data.sessionId);
      } else if (data.type === 'updateForm') {
        // Handle form updates from other users
        setFormData(data.formData);
      }
    };

    currentSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (currentSocket) currentSocket.close();
    };
  }, []);

  // Handle form submission and updates
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Broadcast form data to other users
    socketRef.current?.send(JSON.stringify({
      type: 'updateForm',
      sessionId,
      formData
    }));
  };

  useEffect(() => {
    if (sessionId) {
      socketRef.current?.send(JSON.stringify({ type: 'create', sessionId }));
    } else {
      // Create a new session if no sessionId is set
      socketRef.current?.send(JSON.stringify({ type: 'create' }));
    }
  }, [sessionId]);

  return (
    <div>
      {sessionId && <h2>Session ID: {sessionId}</h2>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
        />
        <button type="submit">Submit</button>
      </form>
      {sessionId && (
        <button onClick={() => navigate(`/${sessionId}`)}>Monitor this session</button>
      )}
    </div>
  );
};

export default CreateSession;
