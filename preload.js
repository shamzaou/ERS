// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Expose file operations
  fileSystem: {
    readFile: (filePath) => ipcRenderer.invoke('readFile', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('writeFile', filePath, data)
  },
  // Expose environment variables
  env: {
    get: (name) => ipcRenderer.invoke('getEnv', name)
  }
});