const { contextBridge, ipcRenderer } = require('electron');



contextBridge.exposeInMainWorld('electronAPI', {
    macrosChanged: () => ipcRenderer.send('macros-changed'),
    onBulbsChanged: (callback) => ipcRenderer.on('bulbs-changed', callback),
    getBackendPort: () => ipcRenderer.invoke('get-backend-port')
});