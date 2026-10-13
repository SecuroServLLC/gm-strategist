import { Tablet, Smartphone, Monitor, Gamepad2 } from 'lucide-react';
export const DEVICE_TYPES = {
  terminal: { label: 'Terminal', description: 'Passivt nettbrett med karaktervalg', icon: Tablet },
  player: { label: 'Spillerlenke', description: 'Egen enhet med innlogging', icon: Smartphone },
  gamedisplay: { label: 'Spilledisplay', description: 'Felles skjerm', icon: Monitor },
  game: { label: 'Spill', description: 'Økt-hub', icon: Gamepad2 },
};