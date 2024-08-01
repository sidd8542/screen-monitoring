{/* <>Screen monitor by admin and access by sessionId</> */}

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path  = require('path')

// Create an Express app
const app = express();
const port = 5000;

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });


let clients = [];

app.use(express.static(path.join(__dirname, 'build')));

wss.on('connection', (ws) => {
    clients.push(ws);
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Broadcast the received message to all clients
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
        console.log('Client disconnected');
    });
});

// Define a route for the Express app
app.get('/', (req, res) => {
    res.send('WebSocket server is running');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



/* <>Screen Sharing and camera on both side</> */

// server.js
// const http = require('http');
// const socketIo = require('socket.io');
// const express = require('express');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);

// app.use(cors());

// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3000", // Replace with your frontend URL
//     methods: ["GET", "POST"]
//   }
// });

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   socket.on('offer', (data) => {
//     socket.broadcast.emit('offer', data);
//   });

//   socket.on('answer', (data) => {
//     socket.broadcast.emit('answer', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected:', socket.id);
//   });
// });

// server.listen(8080, () => {
//   console.log('Server is running on port 8080');
// });




/* <>Screen Sharing by a user and consume by another</> */

// server.js
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 8080 });

// const sessions = {};

// wss.on('connection', (ws) => {
//   console.log('New connection established.');

//   ws.on('message', (message) => {
//     console.log('Received message:', message);
//     const data = JSON.parse(message);

//     switch (data.type) {
//       case 'create':
//         const sessionId = generateSessionId();
//         sessions[sessionId] = { host: ws, clients: [] };
//         ws.send(JSON.stringify({ type: 'sessionId', sessionId }));
//         break;
//       case 'join':
//         const session = sessions[data.sessionId];
//         if (session) {
//           session.clients.push(ws);
//           // Optionally send existing form data to the new client
//         }
//         break;
//       case 'updateForm':
//         const sessionToUpdate = sessions[data.sessionId];
//         if (sessionToUpdate) {
//           sessionToUpdate.host.send(JSON.stringify(data));
//           sessionToUpdate.clients.forEach(client => client.send(JSON.stringify(data)));
//         }
//         break;
//     }
//   });

//   ws.on('close', () => {
//     console.log('Connection closed.');
//     // Clean up session data if needed
//   });
// });

// function generateSessionId() {
//   return Math.random().toString(36).substr(2, 9);
// }

// console.log('Signaling server running on port 8080');
