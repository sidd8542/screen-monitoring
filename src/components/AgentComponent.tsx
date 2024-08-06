import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { IoSendOutline } from 'react-icons/io5';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { AudioRecorder } from 'react-audio-voice-recorder';

// Establish socket connection
// const socket = io('http://localhost:8080');
const socket = io('wss://3360-171-61-202-233.ngrok-free.app');

const AgentComponent: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; text: string; timestamp: string; media?: ArrayBuffer; mediaType?: string }>>([]);
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<ArrayBuffer | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);
  const [visulizer, setVisulizer] = useState(false)

  const messageIdRef = useRef<number>(0);

  const handleReceiveMessage = useCallback((data) => {
    console.log('Received message:', data);

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

      const messageId = 'msg_' + Math.random().toString(36).substr(2, 9);

      const data = {
        id: messageId,
        sessionId,
        sender: 'Agent',
        text: message,
        timestamp: new Date().toLocaleTimeString(),
        media: binaryMedia,
        mediaType: mediaType || ''
      };

      socket.emit('send_message', data);

      setMessages(prevMessages => [...prevMessages, data]);
      setMessage('');
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

  const handleShowMedia = (media: ArrayBuffer, mediaType: string) => {
    setSelectedMedia(media);
    setSelectedMediaType(mediaType);
  };

  const handleCloseMediaModal = () => {
    setSelectedMedia(null);
    setSelectedMediaType(null);
  };

  const handleClose = () => {
    setMedia(null);
    setMediaType(null);
    setShowModal(false);
  };

  const addAudioElement = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    setMedia(new File([blob], "audio.mp3", { type: "audio/mp3" }));
    setMediaType("audio/mp3");
    setShowModal(true);
    setVisulizer(false)
  };

  const handleVisulizer = () => {
    setVisulizer(true)
  }


  function convertToAmPm(timestamp) {
    const [hours, minutes, seconds] = timestamp.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  const renderMedia = (media, mediaType) => {
    console.log('Rendering media:', mediaType);
    const createObjectURL = (data) => URL.createObjectURL(new Blob([data]));
    const mediaUrl = createObjectURL(media);

    switch (mediaType) {
      case 'image/jpeg':
      case 'image/png':
        return <img src={mediaUrl} alt="media" className="w-32 h-32 object-cover rounded cursor-pointer" onClick={() => handleShowMedia(media, mediaType)} />;
      case 'audio/mp3':
        return (
          <video controls className="w-full w-auto h-20 ">
            <source src={mediaUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </video>
        );
      case 'video/mp4':
        return (
          <video controls className="w-full h-32 object-cover rounded mt-2">
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      default:
        return <p>Unsupported media type</p>;
    }
  };


  return (
    <div className="flex flex-col justify-center items-center max-w-lg w-full mx-auto  w-full p-10 h-screen">
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
        <div className="flex flex-col w-full border h-screen relative">
          <header style={{ background: '#343E4E' }} className="text-white py-4 px-6 rounded border flex items-center justify-between">
            <span className="text-lg font-semibold">Session ID: {sessionId}</span>
          </header>
          <div
            style={{ background: "#F0F5F9" }}
            className="flex-1 overflow-y-auto p-6 h-full"
          >
            <div className="grid gap-4">
              {messages.map((msg) => (
                <div key={msg.id}
                  className={`flex items-start gap-4 ${msg.sender === 'Agent' ? 'justify-end' : ''}`}>
                  {msg.sender !== 'Agent' && <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />}
                  <div style={{ minWidth: "100px", maxWidth: "300px" }} className="grid gap-1 text-sm">
                    <div className={`flex items-center gap-2 ${msg.sender === 'User' ? 'justify-end' : ''}`}>
                      {/* <div className="font-medium">{msg.sender}</div> */}
                    </div>
                    <div
                      style={{ background: msg.sender === 'User' ? '#2196F3' : '#343E4E' }}
                      className={`rounded-2xl relative text-white`}
                    >
                      <div className="grid grid-flow-row shadow rounded-2xl justify-stretch p-2">
                        <h6 className="text-base break-words">{msg.text}</h6>
                        <div className="flex flex-col justify-end items-end gap-2">
                          {msg.media && (
                            <div className="mt-2 w-full">
                              {renderMedia(msg.media, msg.mediaType || '')}
                            </div>
                          )}
                          <span className="text-xs text-gray-300">{convertToAmPm(msg.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {msg.sender === 'Agent' && <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t p-6 border flex items-center justify-center gap-2">
            <label htmlFor="file-upload" className="cursor-pointer">
              <AiOutlinePaperClip size={24} className="text-gray-600" />
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2">
              <div onClick={handleVisulizer} className='z-999'>
                <AudioRecorder
                  onRecordingComplete={addAudioElement}
                  audioTrackConstraints={{
                    noiseSuppression: true,
                    echoCancellation: true,
                  }}
                  onNotAllowedOrFound={(err) => console.table(err)}
                  downloadOnSavePress={false}
                  downloadFileExtension="mp3"
                  mediaRecorderOptions={{
                    audioBitsPerSecond: 128000,
                  }}
                  showVisualizer={true}
                />
              </div>
              {
                !visulizer && (
                  <div className='flex justify-center items-centter'>
                    <input
                      id="message"
                      placeholder="Type your message..."
                      className="flex-1 p-1 border rounded-3xl p-2"
                      autoComplete="off"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                )
              }
            </div>
            <div onClick={handleSendMessage}>
              <IoSendOutline size={24} />
            </div>
          </div>
        </div>
      )}

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

      {selectedMedia && selectedMediaType && (
        <Modal>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Media Preview</h2>
            <div className="mb-4">
              <MediaDisplay media={URL.createObjectURL(new Blob([selectedMedia]))} mediaType={selectedMediaType} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleCloseMediaModal}>Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Helper component to display media
const MediaDisplay: React.FC<{ media: string; mediaType: string }> = ({ media, mediaType }) => {
  switch (mediaType) {
    case 'image/jpeg':
    case 'image/png':
      return <img src={media} alt="media" className="w-full h-auto object-cover rounded" />;
    case 'audio/mp3':
      return (
        <audio controls className="w-full">
          <source src={media} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      );
    case 'video/mp4':
      return (
        <video controls className="w-full h-auto object-cover rounded">
          <source src={media} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    default:
      return <p>Unsupported media type</p>;
  }
};

// Modal component
const Modal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg overflow-hidden max-w-lg w-full">
      {children}
    </div>
  </div>
);

export default AgentComponent;
