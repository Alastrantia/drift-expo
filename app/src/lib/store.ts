import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { sceneById, type Layer } from './scenes';

export type Mix = { id: string; name: string; sceneId: string; levels: number[] };

type State = {
  hydrated: boolean;
  onboarded: boolean;
  currentId: string;
  playing: boolean;
  volume: number;
  levels: Record<string, number[]>;
  mixes: Mix[];
  favorites: string[];
  timerEndsAt: number | null;
  timerMinutes: number | null;
  fadeSeconds: number;
  listenedSeconds: number;
  sessions: number;
  playCounts: Record<string, number>;

  finishOnboarding: () => void;
  play: (id?: string) => void;
  pause: () => void;
  toggle: () => void;
  setLevel: (sceneId: string, index: number, value: number) => void;
  setVolume: (v: number) => void;
  setTimer: (minutes: number | null) => void;
  setFade: (seconds: number) => void;
  saveMix: (name: string) => void;
  playMix: (mix: Mix) => void;
  deleteMix: (id: string) => void;
  toggleFavorite: (id: string) => void;
  tick: (seconds: number) => void;
};

export const useDrift = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      currentId: 'rain',
      playing: false,
      volume: 0.8,
      levels: {},
      mixes: [],
      favorites: [],
      timerEndsAt: null,
      timerMinutes: null,
      fadeSeconds: 30,
      listenedSeconds: 0,
      sessions: 0,
      playCounts: {},

      finishOnboarding: () => set({ onboarded: true }),
      play: (id) => {
        const next = id ?? get().currentId;
        const fresh = !get().playing || next !== get().currentId;
        set((s) => ({
          currentId: next,
          playing: true,
          sessions: fresh ? s.sessions + 1 : s.sessions,
          playCounts: fresh ? { ...s.playCounts, [next]: (s.playCounts[next] ?? 0) + 1 } : s.playCounts,
          timerEndsAt: s.timerMinutes && !s.timerEndsAt ? Date.now() + s.timerMinutes * 60_000 : s.timerEndsAt,
        }));
      },
      pause: () => set({ playing: false }),
      toggle: () => (get().playing ? get().pause() : get().play()),
      setLevel: (sceneId, index, value) =>
        set((s) => {
          const l = [...levelsFor(s.levels, sceneId)];
          l[index] = value;
          return { levels: { ...s.levels, [sceneId]: l } };
        }),
      setVolume: (volume) => set({ volume }),
      setTimer: (minutes) =>
        set((s) => ({
          timerMinutes: minutes,
          timerEndsAt: minutes && s.playing ? Date.now() + minutes * 60_000 : null,
        })),
      setFade: (fadeSeconds) => set({ fadeSeconds }),
      saveMix: (name) =>
        set((s) => ({
          mixes: [
            { id: String(Date.now()), name, sceneId: s.currentId, levels: levelsFor(s.levels, s.currentId) },
            ...s.mixes,
          ],
        })),
      playMix: (mix) => {
        set((s) => ({ levels: { ...s.levels, [mix.sceneId]: mix.levels } }));
        get().play(mix.sceneId);
      },
      deleteMix: (id) => set((s) => ({ mixes: s.mixes.filter((m) => m.id !== id) })),
      toggleFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] })),
      tick: (seconds) => set((s) => ({ listenedSeconds: s.listenedSeconds + seconds })),
    }),
    {
      name: 'drift',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, playing, timerEndsAt, ...rest }) => rest,
      onRehydrateStorage: () => () => useDrift.setState({ hydrated: true }),
    },
  ),
);

export function levelsFor(levels: Record<string, number[]>, sceneId: string) {
  return levels[sceneId] ?? sceneById(sceneId).layers.map((l) => l.level);
}

export function targetsFor(sceneId: string, levels: number[], volume: number) {
  const out: Partial<Record<Layer, number>> = {};
  sceneById(sceneId).layers.forEach((l, i) => {
    out[l.layer] = Math.max(out[l.layer] ?? 0, (levels[i] ?? 0) * volume);
  });
  return out;
}
