import React from 'react';
import useSemiBoard from '@/components/semi/useSemiBoard';
import SemiToolbar from '@/components/semi/SemiToolbar';
import SemiGrid from '@/components/semi/SemiGrid';
import SemiCellEditor from '@/components/semi/SemiCellEditor';
import SemiTokens from '@/components/semi/SemiTokens';
import SemiDice from '@/components/semi/SemiDice';
import SemiAudio from '@/components/semi/SemiAudio';
import SemiSceneProposal from '@/components/semi/SemiSceneProposal';
import { cellLabel } from '@/components/semi/terrain';
export default function SemiBoard({ initial, onBack }) {
  const b = useSemiBoard(initial), cellId = b.selected[0];
  const cell = b.map.cells?.[cellId] || {}, label = b.selected.map(id => cellLabel(id,b.map.columns)).join(', ');
  const actor = (b.map.tokens || []).find(t => t.id === b.tokenId)?.name;
  return <div>
    <SemiToolbar board={b} onBack={onBack} />
    <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
      <div className="min-w-0 space-y-5"><section className="rounded-2xl border bg-card p-3 sm:p-5"><div className="flex justify-between gap-3 mb-4 text-xs text-muted-foreground"><span>{b.preview ? 'AVDEKKET VERDEN' : b.moving ? `FLYTT: ${actor || 'Velg brikke'}` : 'KLIKK PÅ KARTET FOR Å FORBEREDE'}</span><span className="font-mono">{label}</span></div><SemiGrid map={b.map} selected={b.selected} onSelect={b.select} preview={b.preview} disabled={b.busy} /><p className="mt-3 text-xs text-muted-foreground">{b.preview ? 'Bare avdekkede ruter vises.' : 'Gullramme = valgt område · Gullprikk = avdekket · Bokstaver = brikke. Store kart kan rulles sidelengs.'}</p></section>
        {!b.preview && <fieldset disabled={b.busy} className="grid md:grid-cols-2 gap-5 min-w-0"><SemiTokens map={b.map} selectedToken={b.tokenId} onSelect={b.setTokenId} onChange={tokens => b.update({ tokens })} cell={cellId} disabled={b.busy} /><div className="space-y-5"><SemiDice rolls={b.map.dice_rolls || []} actor={actor} cell={cellId} label={cellLabel(cellId,b.map.columns)} disabled={b.busy} onRoll={roll => b.update({ dice_rolls: [roll,...(b.map.dice_rolls || [])].slice(0,30) })} /><SemiAudio cell={cell} onChange={b.editCells} /></div></fieldset>}
      </div>
      <fieldset disabled={b.busy} className="space-y-5 min-w-0"><SemiCellEditor cell={cell} label={label} count={b.selected.length} onChange={b.editCells} preview={b.preview} />{!b.preview && <SemiSceneProposal key={label} cell={cell} mapType={b.map.map_type} label={label} onApprove={b.editCells} />}</fieldset>
    </div>
  </div>;
}