import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { AiOutlinePaperClip, AiOutlineCamera, AiFillVideoCamera } from 'react-icons/ai';
import { IoSendOutline } from 'react-icons/io5';
import Webcam from 'react-webcam';
import { AudioRecorder } from 'react-audio-voice-recorder';

// Socket connection
// const socket = io('http://localhost:8080');
const socket = io('wss://3360-171-61-202-233.ngrok-free.app');

const UserComponent: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string, sender: string, text: string, timestamp: string, media?: ArrayBuffer, mediaType?: string }>>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const messageIdRef = useRef<number>(0);
  const webcamRef = useRef<Webcam>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webCam = useRef<WebSocket | null>(null);
  const [visulizer, setVisulizer] = useState(false)





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
      socket.on('offer', handleReceiveOffer);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('offer', handleReceiveOffer);
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
        setCameraOn(false)
        setCameraOpen(false)

      });
    };

    try {
      const binaryMedia = media ? await sendBinaryMedia(media) : undefined;

      const messageId = 'msg_' + Math.random().toString(36).substr(2, 9);

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

  const handleCapturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const base64Data = imageSrc.split(',')[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      setMedia(new File([blob], "photo.jpg", { type: "image/jpeg" }));
      setMediaType("image/jpeg");
      setShowModal(true);
      setCameraOpen(false)
    }
  };


  const handleStartStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log(stream);

      setTimeout(() => {
        console.log(stream);
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        sendVideoFrames(stream);
        setCameraOn(true)
        sendVideoFrames(stream);
      }, 100);
    } catch (error) {
      setCameraOn(false)
      console.error("Error accessing camera:", error);
    }
  };

  const handleStopStream = async () => {
    if (stream) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraOn(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    // Additional clean-up for any other media streams if needed
    navigator.mediaDevices.enumerateDevices().then(devices => {
      devices.forEach(device => {
        if (device.kind === 'videoinput' && device.deviceId) {
          navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: device.deviceId } }
          }).then(mediaStream => {
            mediaStream.getTracks().forEach(track => track.stop());
          }).catch(error => {
            console.error('Error stopping media devices:', error);
          });
        }
      });
    });
  };

  const sendVideoFrames = (stream: MediaStream) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (video && canvas && context) {
      const captureFrame = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = canvas.toDataURL("image/jpeg", 0.5);
        if (webCam.current && webCam.current.readyState === WebSocket.OPEN) {
          webCam.current.send(JSON.stringify({ sessionId, videoFrame: frame }));
        }
      };

      video.onplay = () => {
        setInterval(captureFrame, 300);
      };
    }
  };

  const handleReceiveOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socket.emit("answer", {
      sessionId,
      answer: peerConnectionRef.current.localDescription
    });
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

  return (
    <div className="flex flex-col justify-center items-center max-w-lg w-full mx-auto  w-full p-10 h-screen">
      {!sessionId ? (
        <div className="flex justify-center items-center h-full">
          <button className="p-2 bg-black text-white rounded" onClick={generateSessionId}>
            Start Chat
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full border h-screen relative">
          <header
            style={{ background: "#343E4E" }}
            className="text-white py-4 px-6 rounded border flex items-center justify-between"
          >
            <span className="text-lg font-semibold">Session ID: {sessionId}</span>
            <AiFillVideoCamera
              size={24}
              className="cursor-pointer text-white"
              onClick={streaming ? handleStopStream : handleStartStream}
            />
          </header>
          <div
            style={{ background: "#F0F5F9" }}
            className="flex-1 overflow-y-auto p-6 h-full"
          >
            <div className="grid gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 ${msg.sender === "User" ? "justify-end" : ""}`}
                >
                  {msg.sender !== "User" && (
                    <img
                      src="/image.png"
                      className="w-10 h-10 border rounded-full bg-gray-400"
                    />
                  )}
                  <div
                    style={{ minWidth: "100px", maxWidth: "300px" }}
                    className="grid gap-1 text-sm"
                  >
                    <div
                      className={`flex items-center ${msg.sender === "User" ? "justify-end" : ""}`}
                    ></div>
                    <div
                      style={{
                        background: msg.sender === "User" ? "#343E4E" : "#2196F3",
                      }}
                      className={`rounded-2xl relative text-white`}
                    >
                      <div className="grid grid-flow-row shadow rounded-2xl justify-stretch p-2">
                        <h6 className="text-base break-words">{msg.text}</h6>
                        <div className="flex flex-col justify-end items-end gap-2">
                          {msg.media && (
                            <div className="mt-2">
                              <MediaDisplay media={msg.media} mediaType={msg.mediaType} />
                            </div>
                          )}
                          <span className="text-xs text-gray-300 ">
                            {convertToAmPm(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {msg.sender === "User" && (
                    <img
                      src="/image.png"
                      className="w-10 h-10 border rounded-full bg-gray-400"
                    />
                  )}
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
              <div onClick={handleVisulizer} className="z-999">
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
              {!visulizer && (
                <div className="flex justify-center items-center relative w-full">
                  <input
                    id="message"
                    placeholder="Type your message..."
                    className="flex-1 p-1 border rounded-3xl p-2"
                    autoComplete="off"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <AiOutlineCamera
                    size={24}
                    className="cursor-pointer absolute right-4 text-gray-600"
                    onClick={() => setCameraOpen(!cameraOpen)}
                  />
                </div>
              )}
            </div>
            <div onClick={handleSendMessage}>
              <IoSendOutline size={24} className="text-gray-600" />
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
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            </Modal>
          )}
          {cameraOpen ? (
            <div className="absolute top-16 right-16 border rounded-lg overflow-hidden shadow-lg z-50">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "user",
                  width: 320,
                  height: 240,
                }}
                className="w-80 h-60"
              />
              <button
                onClick={handleCapturePhoto}
                className="p-2 bg-blue-500 text-white rounded w-full"
              >
                Capture Photo
              </button>
            </div>
          ) : (
            cameraOn &&
            videoRef && (
              <div className="absolute top-16 right-16 border rounded-lg overflow-hidden h-28 w-28 shadow-lg z-50">
                <div>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="mt-2 border rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <p onClick={handleStopStream}>close</p>
                </div>
              </div>
            )
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
          <img
            src={mediaUrl}
            alt="media"
            className="w-32 h-32 object-cover rounded cursor-pointer"
            onClick={() => setShowFullScreen(true)}
          />
          {showFullScreen && (
            <Modal>
              <div className="relative flex justify-center items-center">
                <img src={mediaUrl} alt="media" className="w-full h-full object-cover" />
                <button
                  onClick={() => setShowFullScreen(false)}
                  className="absolute top-2 right-2 text-white text-2xl"
                >
                  &times;
                </button>
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
        <video controls className="w-full w-20 h-16 object-cover rounded">
          <source src={mediaUrl} />
          Your browser does not support the audio element.
        </video>
      )}
    </div>
  );
};

const Modal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded shadow p-4 w-1/2 max-w-lg">{children}</div>
    </div>
  );
};

export default UserComponent;
