import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import { join, resolve, extname, basename, sep } from 'path'
import { readdir, readFile } from 'fs/promises'
import { is } from '@electron-toolkit/utils'

const AUDIO_EXT = new Set(['.wav', '.mp3', '.ogg'])

// Dev: app.getAppPath() is the project root. Packaging comes later.
const samplesDir = (): string => join(app.getAppPath(), 'resources', 'samples')
const dragIconPath = (): string => join(app.getAppPath(), 'resources', 'drag-icon.png')

// Only allow files that live inside the samples folder and are audio.
function isAllowed(p: string): boolean {
  const full = resolve(p)
  return full.startsWith(samplesDir() + sep) && AUDIO_EXT.has(extname(full).toLowerCase())
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 760,
    height: 560,
    backgroundColor: '#18202b',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.handle('list-samples', async () => {
  const files = await readdir(samplesDir())
  return files
    .filter((f) => AUDIO_EXT.has(extname(f).toLowerCase()))
    .sort()
    .map((f) => ({ name: basename(f, extname(f)), path: join(samplesDir(), f) }))
})

ipcMain.handle('read-audio', async (_event, filePath: string) => {
  if (!isAllowed(filePath)) throw new Error('File not allowed')
  return readFile(filePath)
})

// The key piece: hand the real file to the OS so CapCut / Premiere accept the drop.
ipcMain.on('drag-start', (event, filePath: string) => {
  if (!isAllowed(filePath)) return
  event.sender.startDrag({
    file: filePath,
    icon: nativeImage.createFromPath(dragIconPath())
  })
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
