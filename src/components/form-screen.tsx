import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import "../styles/monitor-form.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CursorData {
  x: number;
  y: number;
  action: any;
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
  error?: { [key: string]: string };
  focusedField?: string | null;
}

const FormScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    service: "",
    message: ""
  });
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const socket = useRef<WebSocket | null>(null);
  let mouseX = 0,
    mouseY = 0;

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:8080");
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

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  const sendTrackingData = (
    updatedFormData?: FormData,
    cursorAction?: string,
    errorMessages?: { [key: string]: string },
    focusedField?: string
  ) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) return;
  
    // Log error messages and other data before sending
    console.log('Sending tracking data with errors:', errorMessages);
  
    const trackingData: TrackingData = {
      sessionId,
      cursor: { x: mouseX, y: mouseY, action: cursorAction },
      formData: updatedFormData || formData,
      error: errorMessages || errors,
      focusedField,
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

  const validateField = (name: keyof FormData, value: string) => {
    const newErrors: { [key: string]: string } = { ...errors };
  
    switch (name) {
      case "email":
        if (!value) newErrors.email = "Email is required.";
        else delete newErrors.email;
        break;
      case "phone":
        if (!value) newErrors.phone = "Phone number is required.";
        else delete newErrors.phone;
        break;
      default:
        break;
    }
  
    setErrors(newErrors);
    sendTrackingData(formData, undefined, newErrors);
  };
  
  

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    validateField(name as keyof FormData, value);
    sendTrackingData(newFormData);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    sendTrackingData(newFormData);
  };

  const handleFocus = (event) => {
    const { name } = event.target;
    setFocusedField(name); // Update focused field when the field is clicked
    sendTrackingData(formData, undefined, errors, name);
  };
  const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
  
    // Validate the current field
    validateField(name as keyof FormData, value);
  
    // Send tracking data with updated errors
    sendTrackingData(formData, undefined, errors);
  };
  

  const validateForm = (): boolean => {
    const errors: { email?: string; phone?: string } = {};
    let isValid = true;

    if (!formData.email) {
      errors.email = "Email is required.";
      isValid = false;
    }

    if (!formData.phone) {
      errors.phone = "Phone number is required.";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  
  if (!validateForm()) {
    toast.error("Please fill in all required fields.");
    sendTrackingData(undefined, undefined, errors); // Send current errors
    return;
  }
  
  // Perform form submission logic here (e.g., send data to server)
  toast.success("Appointment booked successfully!");
};

  
  return (
    <div className="flex flex-col justify-center items-center h-full max-w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto bg-white mt-10 shadow-lg rounded-lg overflow-hidden md:max-w-lg lg:max-w-xl">
      <div className="text-2xl rounded-lg py-4 px-6 bg-gray-900 text-white text-center font-bold uppercase">
        Book an Appointment
      </div>
      <div className="session-info py-2 px-6">
        <p>Session ID: {sessionId}</p>
      </div>
      <form className="shadow-b w-full py-4 px-6" action="" method="POST" onSubmit={handleSubmit}>
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
            onBlur={handleBlur}
            onFocus={handleFocus} // Add onFocus handler
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
            onBlur={handleBlur}
            onFocus={handleFocus} // Add onFocus handler
            placeholder="Enter your email"
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
            onBlur={handleBlur}
            onFocus={handleFocus} // Add onFocus handler
            placeholder="Enter your phone number"
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>
        <div className="form-group mb-4">
          <label htmlFor="date" className="block text-gray-700 font-bold mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            onFocus={handleFocus} // Add onFocus handler
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
            onFocus={handleFocus} // Add onFocus handler
            value={formData.time}
            onChange={handleInputChange}
            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            onChange={handleSelectChange}
            onFocus={handleFocus} // Add onFocus handler
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
          <label htmlFor="message" className="block text-gray-700 font-bold mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus} // Add onFocus handler
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
      <ToastContainer />
    </div>
  );
};

export default FormScreen;
