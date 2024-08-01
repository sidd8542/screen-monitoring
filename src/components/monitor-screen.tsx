import React, { useEffect, useState, useRef } from "react";
import "../styles/monitor-form.css";

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
  cursor: CursorData;
  formData: FormData;
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
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    // socket.current = new WebSocket("ws://localhost:8080");
    socket.current = new WebSocket("wss://web-socks-01.azurewebsites.net");

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
              data = JSON.parse(reader.result) as TrackingData;
              handleData(data);
            } catch (error) {
              console.error("Error parsing WebSocket message:", error);
            }
          }
        };
        reader.readAsText(event.data);
      } else if (typeof event.data === "string") {
        try {
          data = JSON.parse(event.data) as TrackingData;
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
    setFormData({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      service: "",
      message: "",
    });
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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div
      className="flex justify-center items-center h-full max-w-md mx-auto bg-white mt-10 shadow-lg rounded-lg overflow-hidden"
    >
      {!isAuthorized ? (
        <div>
          <form
            onSubmit={handleSessionIdSubmit}
            className="flex flex-col w-full m-5 justify-center items-center h-full"
          >
            <div className="form-group">
              <label htmlFor="sessionId">Enter Session ID:</label>
              <input
                type="text"
                id="sessionId"
                value={inputSessionId}
                onChange={handleInputChange}
                placeholder="Enter session ID"
                className="form-control"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              Submit
            </button>
            {sessionError && <p className="error-message">{sessionError}</p>}
          </form>
        </div>
      ) : (
        <>
          <div className="flex flex-col justify-center items-center shadow-lg w-full p-5 bg-white rounded-lg overflow-hidden">
            <div className="text-2xl py-4 px-6 bg-gray-900 text-white rounded-lg text-center font-bold uppercase">
              Book an Appointment
            </div>
            <div className="session-info py-2 px-6">
              <p>Active Session ID: {sessionId}</p>
            </div>
            <form className="shadow-b w-full py-4 px-6">
              <div className="form-group mb-4">
                <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="date" className="block text-gray-700 font-bold mb-2">
                  Date
                </label>
                <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-control"
          />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="time" className="block text-gray-700 font-bold mb-2">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="service" className="block text-gray-700 font-bold mb-2">
                  Service
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  className="form-control"
                  disabled
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  <option value="haircut">Haircut</option>
                  <option value="coloring">Coloring</option>
                  <option value="styling">Styling</option>
                  <option value="facial">Facial</option>
                </select>
              </div>
              <div className="form-group mb-4">
                <label htmlFor="message" className="block text-gray-700 font-bold mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  readOnly
                  className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
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
        </>
      )}
    </div>
  );
};

export default MonitorScreen;
