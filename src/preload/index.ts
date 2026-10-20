import { contextBridge, ipcRenderer } from 'electron'

const api = {
  listSamples: (): Promise<{ name: string; path: string }[]> => ipcRenderer.invoke('list-samples'),
  readAudio: (filePath: string): Promise<Uint8Array> => ipcRenderer.invoke('read-audio', filePath),
  startDrag: (filePath: string): void => ipcRenderer.send('drag-start', filePath)
}

contextBridge.exposeInMainWorld('api', api)
