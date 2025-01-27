// src/config/electron.js
const isDev = require('electron-is-dev');
const path = require('path');

module.exports = {
  isDev,
  appPath: isDev ? path.join(__dirname, '../..') : path.join(process.resourcesPath, 'app'),
  logsPath: isDev ? 
    path.join(__dirname, '../../logs') : 
    path.join(process.env.APPDATA || process.env.HOME, '.uae-emergency/logs'),
  
  // Add any other configuration settings here
  updateInterval: 5000, // 5 seconds
  mapDefaultCenter: [54.3773, 24.4539],
  mapDefaultZoom: 12
};