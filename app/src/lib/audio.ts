import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import type { Layer } from './scenes';

const SOURCES: Record<Layer, number> = {
  rumble: require('../../assets/sounds/rumble.m4a'),
  air: require('../../assets/sounds/air.m4a'),
  rain: require('../../assets/sounds/rain.m4a'),
  waves: require('../../assets/sounds/waves.m4a'),
  wind: require('../../assets/sounds/wind.m4a'),
  crackle: require('../../assets/sounds/crackle.m4a'),
  drone: require('../../assets/sounds/drone.m4a'),
};

const players: Partial<Record<Layer, AudioPlayer>> = {};
const current: Partial<Record<Layer, number>> = {};
let ramp: ReturnType<typeof setInterval> | null = null;
let configured = false;

function player(layer: Layer) {
  let p = players[layer];
  if (!p) {
    p = createAudioPlayer(SOURCES[layer]);
    p.loop = true;
    p.volume = 0;
    players[layer] = p;
  }
  return p;
}

async function configure() {
  if (configured) return;
  configured = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'mixWithOthers' });
  } catch (e) {
    console.warn('Drift: audio mode', e);
  }
}

/**
 * Ramp every layer to its target volume. Layers that end at zero are paused,
 * so silent layers never cost battery.
 */
export function mixTo(targets: Partial<Record<Layer, number>>, durationMs = 1200) {
  configure();
  if (ramp) clearInterval(ramp);
  const layers = new Set<Layer>([...(Object.keys(targets) as Layer[]), ...(Object.keys(current) as Layer[])]);
  const from: Partial<Record<Layer, number>> = {};
  layers.forEach((l) => {
    from[l] = current[l] ?? 0;
    if ((targets[l] ?? 0) > 0) {
      const p = player(l);
      if (!p.playing) p.play();
    }
  });
  const started = Date.now();
  const step = () => {
    const k = durationMs <= 0 ? 1 : Math.min(1, (Date.now() - started) / durationMs);
    const eased = 1 - Math.pow(1 - k, 3);
    layers.forEach((l) => {
      const v = (from[l] ?? 0) + ((targets[l] ?? 0) - (from[l] ?? 0)) * eased;
      current[l] = v;
      const p = players[l];
      if (p) p.volume = v;
    });
    if (k >= 1) {
      if (ramp) clearInterval(ramp);
      ramp = null;
      layers.forEach((l) => {
        if ((targets[l] ?? 0) <= 0.001) {
          players[l]?.pause();
          delete current[l];
        }
      });
    }
  };
  step();
  ramp = setInterval(step, 40);
}
