//require('dotenv').config();
const { app, BrowserWindow } = require('electron');
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const cors = require('cors');

// Express app setup
const expressApp = express();
expressApp.use(cors());

const server = http.createServer(expressApp);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true
    }
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.webContents.openDevTools();

  // Set CSP headers with proper permissions for Mapbox
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://localhost:* ws://localhost:*; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://api.mapbox.com; " +
          "style-src 'self' 'unsafe-inline' https://api.mapbox.com; " +
          "img-src 'self' data: blob: https://*.mapbox.com; " +
          "connect-src 'self' http://localhost:* ws://localhost:* https://*.mapbox.com; " +
          "worker-src blob: 'self'; " +
          "child-src blob: 'self';"
        ]
      }
    });
  });
}

// Socket.IO configuration
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});