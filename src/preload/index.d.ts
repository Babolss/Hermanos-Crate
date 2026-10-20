export {}

declare global {
  interface Window {
    api: {
      listSamples: () => Promise<{ name: string; path: string }[]>
      readAudio: (filePath: string) => Promise<Uint8Array>
      startDrag: (filePath: string) => void
    }
  }
}
