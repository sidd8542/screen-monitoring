import "../styles/monitor-form.css";
import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlay, FaStop, FaClock } from 'react-icons/fa';
import RecordRTC, { invokeSaveAsDialog } from 'recordrtc';


interface CursorData {
  x: number;
  y: number;
  action?: "animation-left-click" | "animation-right-click" | "dropdown-open";
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  message: string;
}

interface TrackingData {
  sessionId: string;
  cursor?: CursorData;
  formData?: FormData;
  type?: string;
  message?: string;
  focusedField?: string | null;
  error?: { [key: string]: string };
}

const MonitorScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    service: "",
    message: "",
  });
  const [cursors, setCursors] = useState<{ [key: string]: CursorData }>({});
  const [inputSessionId, setInputSessionId] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionError, setSessionError] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isRecording, setIsRecording] = useState<boolean>(false);
  // const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [recordingError, setRecordingError] = useState('')

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:8080");
    // socket.current = new WebSocket("wss://7bb8-2409-40e3-4d-83b6-2878-bc74-ddb3-5403.ngrok-free.app");

    // socket.current = new WebSocket("wss://web-socks-01.azurewebsites.net");

    socket.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    socket.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.current.onmessage = (event) => {
      let data: TrackingData;
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            try {
              data = JSON.parse(reader.result);
              handleData(data);
            } catch (error) {
              console.error("Error parsing WebSocket message:", error);
            }
          }
        };
        reader.readAsText(event.data);
      } else if (typeof event.data === "string") {
        try {
          data = JSON.parse(event.data);
          handleData(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      }
    };

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [inputSessionId, sessionId]);


  // useEffect(() => {
  //   let stream;
  //   if (isRecording) {
  //     navigator.mediaDevices.getDisplayMedia({ video: true })
  //       .then(strm => {
  //         stream = strm;
  //         const recorder = new MediaRecorder(stream);
  //         setMediaRecorder(recorder);

  //         recorder.ondataavailable = (event) => {
  //           if (event.data.size > 0) {
  //             setRecordedChunks(prev => [...prev, event.data]);
  //           }
  //         };

  //         recorder.onstart = () => {
  //           console.log("Recording started");
  //           // Start the timer
  //           const interval = setInterval(() => {
  //             setTimer(prev => prev + 1);
  //           }, 1000);
  //           setTimerInterval(interval);
  //         };

  //         recorder.onstop = () => {
  //           console.log("Recording stopped");
  //           clearInterval(timerInterval);
  //           const blob = new Blob(recordedChunks, { type: 'video/mp4' });
  //           const url = URL.createObjectURL(blob);
  //           const a = document.createElement('a');
  //           a.href = url;
  //           a.download = 'session.mp4';
  //           a.click();
  //           URL.revokeObjectURL(url);
  //           setRecordedChunks([]);
  //           setTimer(0);
  //           stopCamera(stream);
  //         };

  //         recorder.start();
  //       })
  //       .catch(error => {
  //         setIsRecording(false);
  //         setRecordingError('Your browser does not support recording. Please try with another version or desktop.');
  //         console.error("Error accessing display media:", error);
  //       });
  //   } else {
  //     if (mediaRecorder && mediaRecorder.state !== 'inactive') {
  //       mediaRecorder.stop();
  //     }
  //   }

  //   return () => {
  //     if (stream) {
  //       stopCamera(stream);
  //     }
  //   };
  // }, [isRecording]);

  const handleData = (data: TrackingData) => {
    console.log(data);

    if (data.type === 'toast') {
      if (data.sessionId === sessionId || data.sessionId === inputSessionId) {
        toast.success(data.message || "Operation successful");
      }
      return;
    }

    if (data.sessionId === sessionId || data.sessionId === inputSessionId) {
      if (data.cursor) {
        setCursors((prevCursors) => ({
          ...prevCursors,
          [data.sessionId]: data.cursor,
        }));
      }
      if (data.formData) {
        setFormData(data.formData);
      }
      if (data.focusedField) {
        setFocusedField(data.focusedField);
      }
      if (data.error) {
        setErrors(data.error);
      }
      setIsAuthorized(true);
      setSessionError("");
    } else {
      setSessionError("Invalid session ID or no active session.");
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSessionId(event.target.value);
  };

  const handleSessionIdSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSessionId(inputSessionId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [videoURL, setVideoURL] = useState('');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [blob, setBlob] = useState(null);
  const [stream, setStream] = useState(null);

  const refVideo = useRef(null);
  const recorderRef = useRef(null);
  

  const handleStartRecording = async () => {
    try {
     // const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
     const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: 1920,
        height: 1080,
        frameRate: 30,
      },
      audio: false,
    });

    setStream(mediaStream);
    recorderRef.current = new RecordRTC(mediaStream, { type: 'video' });
    recorderRef.current.startRecording();
    } catch (error) {
      console.error('Error accessing display media:', error);
    }
  };

  const handleStopRecording = () => {
    recorderRef.current.stopRecording(() => {
      setBlob(recorderRef.current.getBlob());
    invokeSaveAsDialog(recorderRef.current.getBlob());
    });
  };

  const handleDownloadRecording = () => {

  };

  useEffect(() => {
    if (videoURL && recordedVideoRef.current) {
      recordedVideoRef.current.src = videoURL;
    }
  }, [videoURL]);


  return (
    <>
      <ToastContainer />
      {!isAuthorized ? (
        <div className="flex w-full flex-col justify-center items-center">
          <div className="w-2/4">
            <form
              onSubmit={handleSessionIdSubmit}
              className="flex flex-col w-full justify-center items-center h-full"
            >
              <div className="form-group mb-4 w-full">
                <label htmlFor="sessionId" className="block text-gray-700 font-bold mb-2">
                  Enter Session ID:
                </label>
                <input
                  type="text"
                  id="sessionId"
                  value={inputSessionId}
                  onChange={handleInputChange}
                  placeholder="Enter session ID"
                  className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <button
                type="submit"
                className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 focus:outline-none focus:shadow-outline"
              >
                Submit
              </button>
              {sessionError && <p className="error-message text-red-500 mt-2">{sessionError}</p>}
            </form>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col justify-center items-center">
          <div className="flex flex-col items-center mt-4 space-y-4">
            <div className="text-xl font-semibold">
              {isRecording && timer > 0 ? (
                <>
                  <FaClock className="inline mr-2" />
                  {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                </>
              ) : null}
            </div>
            <div className="flex space-x-4">
           {recordingError && recordingError.length > 0 ? (
                <p>${recordingError}</p>
           ) : (
            <div className="flex flex-row gap-5">
                          <button
        id="startBtn"
        onClick={handleStartRecording}
        disabled={isRecording}
        className={`bg-green-500 text-white py-2 px-4 rounded hover:bg-green-400 focus:outline-none focus:shadow-outline ${isRecording ? 'cursor-not-allowed' : ''}`}
      >
        Start Recording
      </button>
      <button
        id="stopBtn"
        onClick={handleStopRecording}
        className={`bg-red-500 text-white py-2 px-4 rounded hover:bg-red-400 focus:outline-none focus:shadow-outline }`}
      >
        Stop Recording
      </button>

            </div>
           )}
            </div>
          </div>
          <div className="flex flex-col justify-center items-center h-full max-w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto bg-white mt-10 shadow-lg rounded-lg overflow-hidden md:max-w-lg lg:max-w-xl">
            <div className="text-2xl py-4 px-6 bg-gray-900 text-white rounded-lg text-center font-bold uppercase">
              Book an Appointment
            </div>
            <div className="session-info py-2 px-6">
              <p>Active Session ID: {sessionId}</p>
            </div>
            <form className="shadow-b w-full py-4 px-6">
              {Object.entries(formData).map(([key, value]) => (
                <div className={`form-group mb-4`} key={key}>
                  <label htmlFor={key} className="block text-gray-700 font-bold mb-2">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  {key === "message" ? (
                    <textarea
                      id={key}
                      name={key}
                      value={value}
                      readOnly
                      className={`form-control ${focusedField === key ? 'highlighted' : ''} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors[key] ? 'border-red-500' : ''}`}
                    />
                  ) : (
                    <input
                      type={key === "email" ? "email" : key === "phone" ? "tel" : key === "date" ? "date" : key === "time" ? "time" : "text"}
                      id={key}
                      name={key}
                      value={value}
                      readOnly
                      className={`form-control ${focusedField === key ? 'highlighted' : ''} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors[key] ? 'border-red-500' : ''}`}
                    />
                  )}
                  {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
                </div>
              ))}
              <div className="flex items-center justify-center mb-4">
                <button
                  disabled
                  className="bg-gray-700 text-white py-2 px-4 rounded cursor-not-allowed focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
          {Object.keys(cursors).map((key) => (
            <div
              key={key}
              className={`cursor ${cursors[key].action || ""}`}
              style={{
                left: `${cursors[key].x}px`,
                top: `${cursors[key].y}px`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default MonitorScreen;
