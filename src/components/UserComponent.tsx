import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { IoSendOutline } from 'react-icons/io5';

// Socket connection
const socket = io('http://localhost:8080');

const UserComponent: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string, sender: string, text: string, timestamp: string, media?: ArrayBuffer, mediaType?: string }>>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const messageIdRef = useRef<number>(0);

  const handleReceiveMessage = useCallback((data: { id: string, sender: string, text: string, timestamp: string, media?: ArrayBuffer, mediaType?: string }) => {
    console.log('Received message:', data);
    setMessages((prevMessages) => {
      if (!prevMessages.find(msg => msg.id === data.id)) {
        return [...prevMessages, data];
      }
      return prevMessages;
    });
  }, []);

  useEffect(() => {
    if (sessionId) {
      socket.emit('join_session', sessionId);
      console.log(`Joined session: ${sessionId}`);

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        console.log('Listener removed');
      };
    }
  }, [sessionId, handleReceiveMessage]);

  const handleSendMessage = async () => {
    if (!message && !media) return;

    const sendBinaryMedia = (file: File): Promise<ArrayBuffer> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as ArrayBuffer);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    };

    try {
      const binaryMedia = media ? await sendBinaryMedia(media) : undefined;

      const messageId = `${messageIdRef.current++}`;

      const data = {
        id: messageId,
        sessionId,
        sender: 'User',
        text: message,
        timestamp: new Date().toLocaleTimeString(),
        media: binaryMedia,
        mediaType: mediaType || ''
      };

      console.log('Sending message:', data);
      socket.emit('send_message', data);

      setMessage('');
      setMessages((prevMessages) => [...prevMessages, data]);
      setMedia(null);
      setMediaType(null); 
      setShowModal(false); 
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setMedia(e.target.files[0]);
      setMediaType(e.target.files[0].type);
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setMedia(null); 
    setMediaType(null); 
    setShowModal(false); 
  }

  const generateSessionId = () => {
    const newSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
  };

  return (
    <div className="flex flex-col w-full max-w-lg p-5 h-screen mx-auto">
      {!sessionId ? (
        <div className="flex justify-center items-center h-full">
          <button className="p-2 bg-black text-white rounded" onClick={generateSessionId}>
            Start Chat
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full border">
          <header style={{ background: "#343E4E" }} className="text-white py-4 px-6 rounded border flex items-center">
            <span className="text-lg font-semibold">Session ID: {sessionId}</span>
          </header>
          <div className="flex-1 overflow-y-auto p-6 h-full">
            <div className="grid gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'User' ? 'justify-end' : ''}`}>
                  {msg.sender !== 'User' && <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />}
                  <div className="grid gap-1 text-sm">
                    <div className={`flex items-center gap-2 ${msg.sender === 'User' ? 'justify-end' : ''}`}>
                      <div className="font-medium">{msg.sender}</div>
                      <div className="text-gray-600">{msg.timestamp}</div>
                    </div>
                    <div
                      style={{ background: msg.sender === 'User' ? '#343E4E' : '#2196F3' }}
                      className={`${msg.sender === 'User' ? 'text-white' : 'text-white'} rounded-3xl p-3`}
                    >
                      <p>{msg.text}</p>
                      {msg.media && (
                        <div className="mt-2">
                          <MediaDisplay media={msg.media} mediaType={msg.mediaType} />
                        </div>
                      )}
                    </div>
                  </div>
                  {msg.sender === 'User' && <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t w-full p-4 border flex items-center justify-center gap-2">
            <label htmlFor="file-upload" className="cursor-pointer">
              <AiOutlinePaperClip size={24} className="text-gray-600" />
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
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
          {showModal && media && (
            <Modal>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Send Media</h2>
                <div className="mb-4">
                  <p>File: {media.name}</p>
                  <div className="mt-2">
                    <MediaDisplay media={URL.createObjectURL(media)} mediaType={mediaType} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleClose}>Cancel</button>
                  <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleSendMessage}>Send</button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
};

const MediaDisplay: React.FC<{ media: ArrayBuffer | string; mediaType: string | null }> = ({ media, mediaType }) => {
  const [showFullScreen, setShowFullScreen] = useState<boolean>(false);

  const createObjectURL = (data: ArrayBuffer) => {
    return URL.createObjectURL(new Blob([data]));
  };

  const mediaUrl = typeof media === 'string' ? media : createObjectURL(media);

  return (
    <div className="media-preview">
      {mediaType?.startsWith('image/') && (
        <>
          <img src={mediaUrl} alt="media" className="w-32 h-32 object-cover rounded cursor-pointer" onClick={() => setShowFullScreen(true)} />
          {showFullScreen && (
            <Modal>
              <div className="relative flex justify-center items-center">
                <img src={mediaUrl} alt="media" className="w-full h-full object-cover" />
                <button onClick={() => setShowFullScreen(false)} className="absolute top-2 right-2 text-white text-2xl">&times;</button>
              </div>
            </Modal>
          )}
        </>
      )}
      {mediaType?.startsWith('video/') && (
        <video controls className="w-32 h-32 object-cover rounded">
          <source src={mediaUrl} />
          Your browser does not support the video tag.
        </video>
      )}
      {mediaType?.startsWith('audio/') && (
        <audio controls>
          <source src={mediaUrl} />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

const Modal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">{children}</div>
  </div>
);

export default UserComponent;
