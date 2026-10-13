import { Trees, Waves, Mountain, Castle, Landmark, Sprout } from 'lucide-react';
export const terrains = {
  plain: { label: 'Slette', icon: Sprout, color: 'bg-secondary/60 text-muted-foreground' },
  forest: { label: 'Skog', icon: Trees, color: 'bg-chart-2/20 text-chart-2' },
  water: { label: 'Vann', icon: Waves, color: 'bg-chart-3/20 text-chart-3' },
  mountain: { label: 'Fjell', icon: Mountain, color: 'bg-muted text-foreground' },
  settlement: { label: 'Bebyggelse', icon: Castle, color: 'bg-primary/20 text-primary' },
  ruins: { label: 'Ruiner', icon: Landmark, color: 'bg-chart-4/20 text-chart-4' },
};
export const cellLabel = (index, columns) => `${String.fromCharCode(65 + index % columns)}${Math.floor(index / columns) + 1}`;