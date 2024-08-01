import React, { useRef, useEffect, useState } from 'react';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';

const socket = io('http://localhost:8080'); // Replace with your signaling server URL

const CanvasStreamForm: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);

  useEffect(() => {
    const handleNewPeer = () => {
      const newPeer = new SimplePeer({
        initiator: window.location.hash === '#init',
        trickle: false,
      });

      newPeer.on('signal', (data) => {
        if (data.type === 'offer') {
          socket.emit('offer', data);
        } else if (data.type === 'answer') {
          socket.emit('answer', data);
        }
      });

      newPeer.on('connect', () => {
        console.log('Connected to peer');
      });

      setPeer(newPeer);
    };

    socket.on('offer', (data) => {
      if (peer) {
        peer.signal(data);
      } else {
        const newPeer = new SimplePeer({
          initiator: false,
          trickle: false,
        });

        newPeer.on('signal', (data) => {
          socket.emit('answer', data);
        });

        newPeer.on('connect', () => {
          console.log('Connected to peer');
        });

        setPeer(newPeer);
        newPeer.signal(data);
      }
    });

    socket.on('connect', handleNewPeer);

    return () => {
      socket.off('connect', handleNewPeer);
    };
  }, [peer]);

  useEffect(() => {
    if (peer && canvasRef.current) {
      const stream = canvasRef.current.captureStream();
      peer.addStream(stream);

      socket.on('answer', (data) => {
        peer.signal(data);
      });
    }
  }, [peer]);

  useEffect(() => {
    const renderFormOnCanvas = () => {
      const canvas = canvasRef.current;
      const form = formRef.current;
      if (!canvas || !form) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '16px Arial';

      const data = new XMLSerializer().serializeToString(form);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
                     <foreignObject width="100%" height="100%">
                       <div xmlns="http://www.w3.org/1999/xhtml">${data}</div>
                     </foreignObject>
                   </svg>`;
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    };

    const intervalId = setInterval(renderFormOnCanvas, 1000); // Render every second

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className='w-full h-full bg-white'>
      <div ref={formRef} style={{ display: 'block', position: 'absolute', zIndex: -1}}>
        <form>
          <label>
            Name:
            <input type="text" name="name" />
          </label>
          <br />
          <label>
            Email:
            <input type="email" name="email" />
          </label>
          <br />
          <button type="submit">Submit</button>
        </form>
      </div>
      <canvas ref={canvasRef} width="640" height="480" style={{ border: '1px solid black' }} />
    </div>
  );
};

export default CanvasStreamForm;
