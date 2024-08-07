import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import "../styles/monitor-form.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegCopy, FaCamera, FaStop } from "react-icons/fa";
import { MdOutlineSupportAgent } from "react-icons/md";
import UserComponent from "./UserComponent";
import { IoMdClose } from "react-icons/io";
import { ReactMediaRecorder, useReactMediaRecorder } from "react-media-recorder";



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
    const [chatSesionId, setchatSesionId] = useState<string>(uuidv4());
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const socket = useRef<WebSocket | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copyStatus, setCopyStatus] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraOn, setCameraOn] = useState(false)

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

        console.log('Sending tracking data with errors:', errorMessages);

        const trackingData: TrackingData = {
            sessionId,
            cursor: { x: mouseX, y: mouseY, action: cursorAction },
            formData: updatedFormData || formData,
            error: errorMessages || errors,
            focusedField
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
        setFocusedField(name);
        sendTrackingData(formData, undefined, errors, name);
    };

    const handleBlur = (event) => {
        const { name, value } = event.target;
        validateField(name as keyof FormData, value);
        sendTrackingData(formData, undefined, errors);
    };

    const copySessionId = () => {
        navigator.clipboard.writeText(sessionId).then(() => {
            setCopyStatus(true)
        }).catch((err) => {
            console.error("Failed to copy session ID: ", err);
            setCopyStatus(false)
        });
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
            sendTrackingData(undefined, undefined, errors);
            return;
        }

        toast.success("Appointment booked successfully!");
    };

    const [permission, setPermission] = useState(false);

    const getCameraPermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });
                setPermission(true);
                setStream(streamData);
                console.log(streamData);

            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    // const handleStartCamera = async () => {
    //     try {
    // const { status, startRecording, stopRecording, mediaBlobUrl } =
    // useReactMediaRecorder({ video: true })
    //     } catch (error) {
    //         setCameraOn(false)
    //         console.error("Error accessing camera:", error);
    //     }
    // };

    const handleStopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            setCameraOn(false)
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                setCameraOn(false)
            }
        }
    };

    const [isComponentVisible, setIsComponentVisible] = useState(false);

    const generateSessionId = () => {
        const newSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        setchatSesionId(newSessionId);
      };

    const handleButtonClick = () => {
        setIsComponentVisible(!isComponentVisible);
        if(!chatSesionId){
            generateSessionId()
        }
    };

    const sendVideoFrames = (stream: MediaStream) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (video && canvas && context) {
            const captureFrame = () => {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const frame = canvas.toDataURL("image/jpeg", 0.5); // Adjust quality as needed
                if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                    socket.current.send(JSON.stringify({ sessionId, videoFrame: frame }));
                }
            };

            video.onplay = () => {
                setInterval(captureFrame, 300); // Adjust interval as needed
            };
        }
    };

    return (
        <div className="flex flex-row justify-center h-3/4 w-full ">

            <div
                className="flex flex-col justify-center items-center h-full gap-5 max-w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto bg-white mt-10 rounded-lg overflow-hidden md:max-w-lg lg:max-w-xl">
                <div className="flex items-center gap-5 flex-col justify-between">
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={getCameraPermission}
                            className="bg-blue-500 text-white rounded-md flex items-center px-4 py-2 hover:bg-blue-600 transition"
                        >
                            <FaCamera className="h-5 w-5 mr-2" />
                            Start Camera
                        </button>
                        <button
                            type="button"
                            onClick={handleStopCamera}
                            className="bg-red-500 text-white rounded-md flex items-center px-4 py-2 hover:bg-red-600 transition"
                        >
                            <FaStop className="h-5 w-5 mr-2" />
                            Stop Camera
                        </button>
                    </div>

                </div>
                <div className="text-2xl rounded-lg py-4 px-6 bg-gray-900 text-white text-center font-bold uppercase">
                    Book an Appointment
                </div>
                <div className="session-info py-2 px-6 gap-5 flex items-center justify-between">
                    <p>Session ID: {sessionId}</p>
                    <FaRegCopy onClick={copySessionId} title='Copy Session Id' className="mr-2 cursor-pointer" />
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
                            onFocus={handleFocus}
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
                            onFocus={handleFocus}
                            placeholder="Enter your email"
                            className={`form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? "border-red-500" : ""
                                }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">
                            Phone
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            placeholder="Enter your phone number"
                            className={`form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.phone ? "border-red-500" : ""
                                }`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone}</p>}
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
                            onBlur={handleBlur}
                            onFocus={handleFocus}
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
                            onBlur={handleBlur}
                            onFocus={handleFocus}
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
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="">Select a service</option>
                            <option value="consultation">Consultation</option>
                            <option value="diagnosis">Diagnosis</option>
                            <option value="therapy">Therapy</option>
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
                            onFocus={handleFocus}
                            placeholder="Enter your message"
                            className="form-control shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                    >
                        Book Appointment
                    </button>
                </form>
                <ToastContainer />
            </div>
            {
                cameraOn && videoRef && (
                    <div className="gap-5 flex flex-col top-0 justify-start h-1/4 m-5">
                        <div>
                            <video ref={videoRef} autoPlay muted className=" mt-2 border rounded-lg" />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    </div>
                )
            }
            <div className="gap-5 w-full flex flex-col bottom-10 justify-end w-20 items-end h-screen p-5">
                {
                    isComponentVisible ? (
                        <div
                            style={{ backgroundColor: "#3B82F6" }}
                            className=" bottom-5  p-3 text-white rounded-full shadow-2xl flex items-center hover:scale-105 hover:filter transition duration-300 ease-in-out hover z-50 cursor-pointer"
                            onClick={handleButtonClick}
                        >
                            <IoMdClose size={32} />

                        </div>
                    ) : (
                        <div
                            style={{ backgroundColor: "#3B82F6" }}
                            className="relative justify-end items-end p-3 text-white rounded-full shadow-2xl flex items-center hover:scale-105 hover:filter transition duration-300 ease-in-out hover z-50 cursor-pointer"
                            onClick={handleButtonClick}
                        >
                            <MdOutlineSupportAgent size={32} />
                        </div>
                    )
                }
                {isComponentVisible && (
                    <div className="side-panel-component absolute  mt-4 mr-10 flex flex-row justify-end items-end h-full ">
                        {/* The component to be displayed */}
                        <UserComponent sessionId={chatSesionId}/>
                    </div>
                )}
            </div>

        </div>
    );
};

export default FormScreen;
