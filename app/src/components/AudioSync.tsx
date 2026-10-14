import { useEffect } from 'react';
import { mixTo } from '../lib/audio';
import { levelsFor, targetsFor, useDrift } from '../lib/store';

/** Keeps the audio engine in step with the store, and runs the sleep timer. */
export function AudioSync() {
  const playing = useDrift((s) => s.playing);
  const currentId = useDrift((s) => s.currentId);
  const levels = useDrift((s) => levelsFor(s.levels, s.currentId).join(','));
  const volume = useDrift((s) => s.volume);

  useEffect(() => {
    const l = levels.split(',').map(Number);
    mixTo(playing ? targetsFor(currentId, l, volume) : {}, playing ? 1500 : 900);
  }, [playing, currentId, levels, volume]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const s = useDrift.getState();
      s.tick(1);
      if (!s.timerEndsAt) return;
      const left = (s.timerEndsAt - Date.now()) / 1000;
      if (left <= 0) {
        useDrift.setState({ playing: false, timerEndsAt: null, timerMinutes: null });
      } else if (left <= s.fadeSeconds) {
        // Gentle fade across the final stretch of the timer.
        const k = left / s.fadeSeconds;
        mixTo(targetsFor(s.currentId, levelsFor(s.levels, s.currentId), s.volume * k), 900);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  return null;
}
