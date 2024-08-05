import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { IoSendOutline } from 'react-icons/io5';

// Establish socket connection
const socket = io('http://localhost:8080');

const AgentComponent: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; text: string; timestamp: string; media?: ArrayBuffer; mediaType?: string }>>([]);
  const [selectedMedia, setSelectedMedia] = useState<ArrayBuffer | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);

  const handleReceiveMessage = useCallback((data: { id: string; sender: string; text: string; timestamp: string; media?: ArrayBuffer; mediaType?: string }) => {
    setMessages(prevMessages => {
      if (!prevMessages.find(msg => msg.id === data.id)) {
        return [...prevMessages, data];
      }
      return prevMessages;
    });
  }, []);

  useEffect(() => {
    if (sessionId) {
      socket.emit('join_session', sessionId);
      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [sessionId, handleReceiveMessage]);

  const handleSendMessage = async () => {
    if (!message) return;

    const messageId = `${Date.now()}`;

    const data = {
      id: messageId,
      sessionId,
      sender: 'Agent',
      text: message,
      timestamp: new Date().toLocaleTimeString(),
    };

    try {
      socket.emit('send_message', data);

      setMessages(prevMessages => [...prevMessages, data]);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMedia = (media: ArrayBuffer, mediaType: string) => {
    const createObjectURL = (data: ArrayBuffer) => URL.createObjectURL(new Blob([data]));

    const mediaUrl = createObjectURL(media);

    switch (mediaType) {
      case 'image/jpeg':
      case 'image/png':
        return <img src={mediaUrl} alt="media" className="w-32 h-32 object-cover rounded cursor-pointer" onClick={() => handleShowMedia(media, mediaType)} />;
      case 'audio/mpeg':
        return (
          <audio controls className="w-full mt-2">
            <source src={mediaUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        );
      case 'video/mp4':
        return (
          <video controls className="w-full h-64 object-cover rounded mt-2">
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      default:
        return <p>Unsupported media type</p>;
    }
  };

  const handleShowMedia = (media: ArrayBuffer, mediaType: string) => {
    setSelectedMedia(media);
    setSelectedMediaType(mediaType);
  };

  const handleCloseMediaModal = () => {
    setSelectedMedia(null);
    setSelectedMediaType(null);
  };

  return (
    <div className="flex flex-col w-full p-5 h-screen">
      {!sessionId ? (
        <div className="flex flex-col items-center justify-center h-full">
          <input
            placeholder="Enter Session ID"
            className="p-2 border rounded mb-2"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
          <button style={{ background: '#343E4E' }} className="p-2 text-white rounded" onClick={() => socket.emit('join_session', sessionId)}>
            Join Session
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full border">
          <header style={{ background: '#343E4E' }} className="text-white py-4 px-6 rounded border flex items-center">
            <span className="text-lg font-semibold">Session ID: {sessionId}</span>
          </header>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'Agent' ? 'justify-end' : ''}`}>
                  {msg.sender !== 'Agent' && <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />}
                  <div className="grid gap-1 text-sm">
                    <div className={`flex items-center gap-2 ${msg.sender === 'Agent' ? 'justify-end' : ''}`}>
                      <div className="font-medium">{msg.sender}</div>
                      <div className="text-gray-600">{msg.timestamp}</div>
                    </div>
                    <div
                      style={{ background: msg.sender === 'Agent' ? '#343E4E' : '#2196F3' }}
                      className={`${msg.sender === 'Agent' ? 'text-white' : 'text-white'} rounded-3xl p-3`}
                    >
                      <p>{msg.text}</p>
                      {msg.media && (
                        <div className="mt-2">
                          {renderMedia(msg.media, msg.mediaType || '')}
                        </div>
                      )}
                    </div>
                  </div>
                  {msg.sender === 'Agent' && <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t p-4 border flex items-center gap-2">
            <input
              id="message"
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-3xl"
              autoComplete="off"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div onClick={handleSendMessage}>
              <IoSendOutline size={24} />
            </div>
          </div>
        </div>
      )}

      {selectedMedia && selectedMediaType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50" onClick={handleCloseMediaModal}>
          <div className="relative p-4 bg-white rounded-lg" onClick={(e) => e.stopPropagation()}>
            {renderMedia(selectedMedia, selectedMediaType)}
            <button onClick={handleCloseMediaModal} className="absolute top-0 right-0 m-2 text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentComponent;
