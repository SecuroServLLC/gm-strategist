import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
export default function useSemiBoard(initial) {
  const [map, setMap] = useState(initial), [selected, setSelected] = useState([0]), [tokenId, setTokenId] = useState('');
  const [area, setArea] = useState(false), [moving, setMoving] = useState(false), [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!dirty) return;
    const unload = e => { e.preventDefault(); e.returnValue = ''; };
    const click = e => { if (e.target.closest('a[href]') && !window.confirm('Kartet har ulagrede endringer. Forlate uten å lagre?')) { e.preventDefault(); e.stopPropagation(); } };
    window.addEventListener('beforeunload', unload); document.addEventListener('click', click, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', click, true); };
  }, [dirty]);
  const update = patch => { setMap(p => ({ ...p, ...patch })); setDirty(true); setSaved(false); };
  const editCells = patch => { const cells = { ...map.cells }; selected.forEach(id => { cells[id] = { ...cells[id], ...patch }; }); update({ cells }); };
  const select = id => {
    if (moving && tokenId && !preview) { update({ tokens: map.tokens.map(t => t.id === tokenId ? { ...t, cell: id } : t) }); setSelected([id]); return; }
    if (area && !preview) { const x = Math.min(id % map.columns, map.columns - 2), y = Math.min(Math.floor(id / map.columns), map.rows - 2), start = y * map.columns + x; setSelected([start,start+1,start+map.columns,start+map.columns+1]); }
    else setSelected([id]);
  };
  const save = async () => {
    setBusy(true); setError('');
    try {
      const { title, cells, tokens, dice_rolls } = map;
      await base44.entities.SemiAnalogMap.update(map.id, { title: title.trim(), cells: cells || {}, tokens: tokens || [], dice_rolls: dice_rolls || [] });
      setDirty(false); setSaved(true); queryClient.invalidateQueries({ queryKey: ['semi-list','SemiAnalogMap',map.campaign_id] });
      queryClient.setQueryData(['semi-map',map.id], map);
    } catch (e) { setError(e.message || 'Kunne ikke lagre. Endringene dine er fortsatt her.'); } finally { setBusy(false); }
  };
  return { map, selected, setSelected, tokenId, setTokenId, area, setArea, moving, setMoving, preview, setPreview, dirty, busy, error, saved, update, editCells, select, save };
}