import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import "../styles/monitor-form.css";

interface CursorData {
  x: number;
  y: number;
  action: any
}

interface FormData {
  name: string;
  message: string;
  time: string;
  email: string;
  service: string;
  date: string;
  phone: string;
}

interface TrackingData {
  sessionId: string;
  cursor: CursorData;
  formData: FormData;
}

const FormScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    message: "",
    time: "",
    phone: "",
    date: "",
    email: "",
    service: "",
  });
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const socket = useRef<WebSocket | null>(null);
  let mouseX = 0,
    mouseY = 0;

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

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  const sendTrackingData = (updatedFormData?: FormData, cursorAction?: string) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) return;
  
    const trackingData: TrackingData = {
      sessionId,
      cursor: { x: mouseX, y: mouseY, action: cursorAction },
      formData: updatedFormData || formData,
    };
  
    socket.current.send(JSON.stringify(trackingData));
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      sendTrackingData();
    };
  
    const handleClick = (event: MouseEvent) => {
      const action = event.button === 0 ? "animation-left-click" : "animation-right-click";
      sendTrackingData(undefined, action);
    };
  
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);
  
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
    };
  }, [formData]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    sendTrackingData(newFormData);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    sendTrackingData(newFormData);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="text-2xl rounded-lg py-4 px-6 bg-gray-900 text-white text-center font-bold uppercase">
        Book an Appointment
      </div>
      <div className="session-info py-2 px-6">
        <p>Session ID: {sessionId}</p>
      </div>
      <form className="shadow-b w-full py-4 px-6" action="" method="POST">
        <div className="form-group mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            onChange={handleInputChange}
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            onChange={handleInputChange}
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="form-group mb-4">
          <label
            htmlFor="service"
            className="block text-gray-700 font-bold mb-2"
          >
            Service
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleSelectChange}
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          <label
            htmlFor="message"
            className="block text-gray-700 font-bold mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Enter any additional information"
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-center mb-4">
          <button
            className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormScreen;
