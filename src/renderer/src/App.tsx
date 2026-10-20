import { useEffect, useRef, useState } from 'react'

type Sound = { name: string; path: string }

export default function App() {
  const [sounds, setSounds] = useState<Sound[]>([])
  const [playing, setPlaying] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const rafRef = useRef(0)

  function stop() {
    cancelAnimationFrame(rafRef.current)
    audioRef.current?.pause()
    audioRef.current = null
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = null
    setPlaying(null)
    setProgress(0)
  }

  async function toggle(sound: Sound) {
    if (playing === sound.path) return stop()
    stop()

    const bytes = await window.api.readAudio(sound.path)
    const url = URL.createObjectURL(new Blob([bytes]))
    const audio = new Audio(url)
    audioRef.current = audio
    urlRef.current = url
    audio.onended = stop

    const tick = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration)
      rafRef.current = requestAnimationFrame(tick)
    }

    setPlaying(sound.path)
    await audio.play()
    tick()
  }

  useEffect(() => {
    window.api.listSamples().then(setSounds)
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="app">
      <header>
        <h1>SFX Preview</h1>
        <p>Click a sound to hear it. Drag it into CapCut or Premiere Pro to import.</p>
      </header>

      {sounds.length === 0 ? (
        <p className="empty">No sounds found. Put .wav, .mp3 or .ogg files in resources/samples.</p>
      ) : (
        <ul className="list">
          {sounds.map((s) => {
            const active = playing === s.path
            return (
              <li
                key={s.path}
                className={active ? 'row active' : 'row'}
                draggable
                onDragStart={(e) => {
                  e.preventDefault()
                  window.api.startDrag(s.path)
                }}
              >
                <span className="fill" style={{ width: active ? `${progress * 100}%` : 0 }} />
                <button
                  className="play"
                  onClick={() => toggle(s)}
                  aria-label={active ? `Stop ${s.name}` : `Play ${s.name}`}
                >
                  {active ? '■' : '▶'}
                </button>
                <span className="name">{s.name}</span>
                <span className="hint">drag to editor</span>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
