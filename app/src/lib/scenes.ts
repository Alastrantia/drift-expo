export type Layer = 'rumble' | 'air' | 'rain' | 'waves' | 'wind' | 'crackle' | 'drone';
export type ArtKind = 'rain' | 'waves' | 'fire' | 'wind' | 'orbit' | 'storm';

export type Scene = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  art: ArtKind;
  tags: string[];
  layers: { layer: Layer; label: string; level: number }[];
};

export const SCENES: Scene[] = [
  {
    id: 'rain',
    name: 'Rainfall',
    subtitle: 'Steady rain on a quiet street',
    description: 'An even, unhurried rain with a low hush beneath it. The classic way to cover a noisy room.',
    art: 'rain',
    tags: ['Sleep', 'Focus', 'Rain'],
    layers: [
      { layer: 'rain', label: 'Rain', level: 0.8 },
      { layer: 'air', label: 'Mist', level: 0.35 },
      { layer: 'rumble', label: 'Distance', level: 0.3 },
    ],
  },
  {
    id: 'tide',
    name: 'Tide',
    subtitle: 'Waves on a pebble shore',
    description: 'Breakers roll in every eight seconds and draw back over the stones. Slow enough to breathe with.',
    art: 'waves',
    tags: ['Sleep', 'Calm', 'Water'],
    layers: [
      { layer: 'waves', label: 'Waves', level: 0.85 },
      { layer: 'rumble', label: 'Deep water', level: 0.4 },
      { layer: 'air', label: 'Spray', level: 0.2 },
    ],
  },
  {
    id: 'hearth',
    name: 'Hearth',
    subtitle: 'A fire burning low',
    description: 'Glowing logs, a soft roar and the occasional crackle. Warmth you can hear.',
    art: 'fire',
    tags: ['Cozy', 'Night'],
    layers: [
      { layer: 'crackle', label: 'Crackle', level: 0.7 },
      { layer: 'rumble', label: 'Embers', level: 0.55 },
      { layer: 'air', label: 'Draft', level: 0.15 },
    ],
  },
  {
    id: 'highland',
    name: 'Highland',
    subtitle: 'Wind across open moorland',
    description: 'Long gusts rising and falling over the hills, with nothing in the way.',
    art: 'wind',
    tags: ['Focus', 'Calm', 'Wind'],
    layers: [
      { layer: 'wind', label: 'Gusts', level: 0.8 },
      { layer: 'air', label: 'Grass', level: 0.3 },
      { layer: 'rumble', label: 'Ground', level: 0.25 },
    ],
  },
  {
    id: 'deep-field',
    name: 'Deep Field',
    subtitle: 'A slow drone from far away',
    description: 'A warm, low hum that barely moves. Nothing happens, and that is the point.',
    art: 'orbit',
    tags: ['Sleep', 'Focus', 'Night'],
    layers: [
      { layer: 'drone', label: 'Hum', level: 0.6 },
      { layer: 'rumble', label: 'Depth', level: 0.3 },
      { layer: 'air', label: 'Dust', level: 0.1 },
    ],
  },
  {
    id: 'storm',
    name: 'Night Storm',
    subtitle: 'Heavy rain, wind and distant thunder',
    description: 'A full storm heard from somewhere warm and dry. Dense enough to drown out almost anything.',
    art: 'storm',
    tags: ['Sleep', 'Rain', 'Wind'],
    layers: [
      { layer: 'rain', label: 'Downpour', level: 0.9 },
      { layer: 'wind', label: 'Wind', level: 0.5 },
      { layer: 'rumble', label: 'Thunder', level: 0.7 },
    ],
  },
];

export const TAGS = ['Sleep', 'Focus', 'Calm', 'Night', 'Rain', 'Water', 'Wind', 'Cozy'];

export const sceneById = (id?: string | null) => SCENES.find((s) => s.id === id) ?? SCENES[0];
