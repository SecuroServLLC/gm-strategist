function conflict(message) { const error = new Error(message); error.status = 409; throw error; }

export async function releaseTerminalCharacter(entities, device) {
  if (device.party_member_id && device.campaign_id) {
    const others = await entities.Device.count({ campaign_id: device.campaign_id, status: 'active', party_member_id: device.party_member_id, id: { $ne: device.id } });
    if (!others) await entities.Character.updateMany({ campaign_id: device.campaign_id, claimed_by: device.party_member_id, claim_status: 'claimed' }, { $set: { claim_status: 'open', claimed_by: '', claim_device_id: '' } });
  }
  await entities.Character.updateMany({ campaign_id: device.campaign_id || '', claim_device_id: device.id, claim_status: 'claimed', claimed_by: { $in: ['', null] } }, { $set: { claim_status: 'open', claim_device_id: '' } });
  await entities.Device.update(device.id, { party_member_id: '', claim_lock: '', claim_lock_until: new Date(0).toISOString() });
}

export async function selectTerminalCharacter(entities, device, characterId) {
  const lock = crypto.randomUUID();
  await entities.Device.updateMany({ id: device.id, status: 'active', campaign_id: device.campaign_id,
    $or: [{ claim_lock: { $exists: false } }, { claim_lock: '' }, { claim_lock_until: { $lt: new Date().toISOString() } }],
  }, { $set: { claim_lock: lock, claim_lock_until: new Date(Date.now() + 45000).toISOString() } });
  const locked = await entities.Device.get(device.id);
  if (locked.claim_lock !== lock) conflict('Et karaktervalg er allerede i gang. Prøv igjen om et øyeblikk.');
  let reserved = false;
  let attached = false;
  try {
    if (locked.status !== 'active' || locked.campaign_id !== device.campaign_id) conflict('Terminalen er ikke lenger med i spillet.');
    if (locked.party_member_id) {
      const existing = await entities.PartyMember.get(locked.party_member_id);
      if (existing?.character_id === characterId && existing.campaign_id === device.campaign_id) return existing;
      conflict('Terminalen har allerede valgt karakter. Be GM åpne karaktervalget på nytt.');
    }
    const character = await entities.Character.get(characterId);
    if (!character || character.campaign_id !== device.campaign_id || character.role === 'antagonist') conflict('Denne karakteren kan ikke velges.');
    if (character.claim_status !== 'open' && !(character.claim_status === 'claimed' && character.claim_device_id === device.id && !character.claimed_by)) conflict('Karakteren er ikke lenger ledig. Velg en annen.');
    const existing = await entities.PartyMember.filter({ campaign_id: device.campaign_id, character_id: characterId }, { limit: 1 });
    let member = existing.items[0];
    if (member && await entities.Device.count({ campaign_id: device.campaign_id, status: 'active', party_member_id: member.id, id: { $ne: device.id } })) conflict('En annen spiller bruker denne karakteren.');
    await entities.Character.updateMany({ id: characterId, campaign_id: device.campaign_id, claim_status: 'open' }, { $set: { claim_status: 'claimed', claimed_by: '', claim_device_id: device.id } });
    const chosen = await entities.Character.get(characterId);
    if (chosen.claim_device_id !== device.id || chosen.claim_status !== 'claimed') conflict('En annen spiller valgte karakteren først.');
    reserved = true;
    if (!member) member = await entities.PartyMember.create({ campaign_id: device.campaign_id, character_id: characterId, name: chosen.name, kind: 'character', status: 'active', current_hp: chosen.hp ?? 0, max_hp: chosen.hp ?? 0 });
    else if (member.status === 'absent') member = await entities.PartyMember.update(member.id, { status: 'active' });
    if (member.status === 'dead') conflict('Karakteren er markert som død. GM må endre status før den kan velges.');
    await entities.Character.update(characterId, { claimed_by: member.id });
    await entities.Device.updateMany({ id: device.id, status: 'active', campaign_id: device.campaign_id, claim_lock: lock }, { $set: { party_member_id: member.id } });
    const current = await entities.Device.get(device.id);
    attached = current.status === 'active' && current.campaign_id === device.campaign_id && current.party_member_id === member.id;
    if (!attached) conflict('GM koblet terminalen fra spillet. Vent på ny godkjenning.');
    return member;
  } finally {
    if (reserved && !attached) await entities.Character.updateMany({ id: characterId, claim_device_id: device.id }, { $set: { claim_status: 'open', claimed_by: '', claim_device_id: '' } });
    await entities.Device.updateMany({ id: device.id, claim_lock: lock }, { $set: { claim_lock: '', claim_lock_until: new Date(0).toISOString() } });
  }
}