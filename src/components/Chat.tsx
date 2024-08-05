import React from 'react';
import { FaCamera, FaFileUpload, FaMicrophone, FaMountain, FaShareAlt } from 'react-icons/fa';

const Component: React.FC = () => {
  return (
    <div className="flex flex-col w-1/2 p-5 h-screen">
      <div className="flex h-full w-full">
        <div className="bg-white border-r w-64 flex border flex-col">
          <div className="flex items-center gap-2 px-4 py-4 border-b">
            <FaMountain className="h-6 w-6" />
            <span className="text-lg font-semibold">Survey Support</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-2 p-4">
              {['John Doe', 'Sarah Anderson', 'Michael Ivanov', 'Emily Wilson'].map((name, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-300 cursor-pointer">
                  <img src="/image.png" className="w-8 h-8 border rounded-full " />
                  <div className="flex-1 truncate">
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-gray-600 truncate">Sample message text...</div>
                  </div>
                  <div className="text-sm text-gray-600">2:39pm</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex w-full h-full border flex-col">
          <header className="bg-black text-white py-4 px-6 flex items-center">
            <div className="flex items-center gap-2">
              <FaMountain className="h-6 w-6" />
              <span className="text-lg font-semibold">Survey Support</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="rounded-full p-2 hover:bg-blue-700">
                <FaCamera className="h-6 w-6" />
                <span className="sr-only">Camera</span>
              </button>
              <button className="rounded-full p-2 hover:bg-blue-700">
                <FaMicrophone className="h-6 w-6" />
                <span className="sr-only">Microphone</span>
              </button>
              <button className="rounded-full p-2 hover:bg-blue-700">
                <FaShareAlt className="h-6 w-6" />
                <span className="sr-only">Share Screen</span>
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 h-full">
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />
                <div className="grid gap-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">Agent</div>
                    <div className="text-gray-600">2:39pm</div>
                  </div>
                  <div>
                    <p>Hello, how can I assist you today?</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 justify-end">
                <div className="grid gap-1 text-sm">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="font-medium">You</div>
                    <div className="text-gray-600">2:40pm</div>
                  </div>
                  <div className="bg-black text-white rounded-lg p-3">
                    <p>I'm having trouble with my order. Can you help me?</p>
                  </div>
                </div>
                <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />
              </div>
              <div className="flex items-start gap-4">
              <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />
                <div className="grid gap-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">Agent</div>
                    <div className="text-gray-600">2:41pm</div>
                  </div>
                  <div>
                    <p>Absolutely, let me take a look at your order. What's your order number?</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 justify-end">
                <div className="grid gap-1 text-sm">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="font-medium">You</div>
                    <div className="text-gray-600">2:42pm</div>
                  </div>
                  <div className="bg-black text-white rounded-lg p-3">
                    <p>My order number is #12345.</p>
                  </div>
                </div>
                <img src="/image.png" className="w-10 h-10 border rounded-full bg-gray-400" />
              </div>
            </div>
          </div>
          <div className="border-t p-4 border flex items-end gap-2">
            <button className="rounded-full p-2 hover:bg-gray-300">
              <FaFileUpload className="h-6 w-6" />
              <span className="sr-only">Attach</span>
            </button>
            <input id="message" placeholder="Type your message..." className="flex-1 p-2 border rounded" autoComplete="off" />
            <button className="p-2 bg-black text-white rounded hover:bg-black-300">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Component;
