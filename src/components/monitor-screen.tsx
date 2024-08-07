import "../styles/monitor-form.css";
import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlay, FaStop, FaClock } from 'react-icons/fa';
import RecordRTC, { invokeSaveAsDialog } from 'recordrtc';
import AgentComponent from "./AgentComponent";
import { IoMdClose } from "react-icons/io";
import { MdOutlineSupportAgent } from "react-icons/md";
import Component from "./table";



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
  chatId?: string;
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
  const [chatSesionId, setchatSesionId] = useState<string>("");
  const [sessionError, setSessionError] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isRecording, setIsRecording] = useState<boolean>(false);
  // const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const socket = useRef<WebSocket | null>(null);
  const [recordingError, setRecordingError] = useState('')
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [sessions, setSessions] = useState([]);



  useEffect(() => {
    // socket.current = new WebSocket("ws://localhost:8080");
    socket.current = new WebSocket("wss://5c05-2409-40e3-102b-e768-af7c-985a-82e4-a022.ngrok-free.app");
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
      console.log(data);

      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            try {
              data = JSON.parse(reader.result);
              handleData(data);
              const obj = [
                { sessionId: data.sessionId ? data.sessionId : 'abcdd', status: "active" },
                { sessionId: "abcdefg123", status: "closed" },
                { sessionId: "hijklmn456", status: "pending" },
              ];
              setSessions(obj)
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


  const handleData = (data: TrackingData) => {
    console.log(data);
    const obj = [
      { sessionId: data.sessionId ? data.sessionId : 'abcdd', status: "active" },
      { sessionId: "abcdefg123", status: "closed" },
      { sessionId: "hijklmn456", status: "pending" },
    ];
    setSessions(obj)
    setSessionId(data.sessionId)
    if (data?.chatId) {
      setIsComponentVisible(true)
      setchatSesionId(data?.chatId)
      console.log(data.chatId);
    } else {
      setIsComponentVisible(false)
    }

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

  const [videoURL, setVideoURL] = useState('');
  const recordedVideoRef = useRef<HTMLVideoElement | null>(null);
  const [blob, setBlob] = useState(null);
  const [stream, setStream] = useState(null);

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
          <div className="w-3/4 flex flex-col justify-center ">
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
            {/* <Component sessionss={sessions} onItemClick={handleClick}></Component> */}
          </div>
        </div>
      ) : (
        <div className="flex flex-row h-full gap-5 w-full items-end justify-center p-4 ">
          <div className="flex flex-col w-full p-2 justify-center shadow-2xl gap-5 items-center bg-white rounded-lg overflow-hidden ">
            <div className="flex items-center flex-col justify-between">
              <div className="flex flex-row gap-2">
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
            <div className="text-2xl rounded-lg py-4 px-6 bg-blue-500 text-white text-center font-bold uppercase">
              Book an Appointment
            </div>
            <div className="session-info py-2 px-6 gap-5 flex items-center justify-between">
              <p>Active Session ID: {sessionId}</p>
            </div>
            <form
              className=" w-full py-4 px-6">
              {Object.entries(formData).map(([key, value]) => (
                <div className="form-group mb-4">
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
                  className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                  type="submit"
                >
                  Book Appointment
                </button>
              </div>
            </form>
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
          <div className="flex flex-col">
            <div className="flex flex-row justify-end items-end">
              <div>
                {
                  isComponentVisible && (
                    <div className="side-panel-component w-full h-full flex justify-center items-center  mr-4 w-32 bg-white shadow-2xl rounded-lg z-50 overflow-auto">
                        <AgentComponent chatId={chatSesionId} />
                      </div>
                  ) 
                }
                </div>
                <div>
                {isComponentVisible ? (
                                <div
                                    style={{ backgroundColor: "#3B82F6" }}
                                    className="p-3 text-white rounded-full w-16 h-16 items-center justify-center shadow-2xl flex  cursor-pointer"
                                >
                                    <IoMdClose size={32} />
                                </div>
                            ) : (
                                <div
                                    style={{ backgroundColor: "#3B82F6" }}
                                    className="p-3 text-white rounded-full w-16 h-16 items-center justify-center shadow-2xl flex items-center cursor-pointer"
                                >
                                    <MdOutlineSupportAgent size={32} />
                                </div>
                            )}

              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default MonitorScreen;
