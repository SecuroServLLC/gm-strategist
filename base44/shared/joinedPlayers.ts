export async function joinedPlayersPage(base44, campaignId, { ids, cursor } = {}) {
  const page = await base44.entities.Device.filter({
    campaign_id: campaignId, device_type: 'terminal', status: 'active',
    ...(ids ? { id: { $in: ids } } : {}),
  }, { sort: 'device_id', limit: 50, cursor, fields: ['device_id', 'label', 'party_member_id'] });
  const memberIds = page.items.map((device) => device.party_member_id).filter(Boolean);
  const members = memberIds.length ? (await base44.entities.PartyMember.filter({ campaign_id: campaignId, id: { $in: memberIds } }, { limit: 50 })).items : [];
  const characterIds = members.map((member) => member.character_id).filter(Boolean);
  const characters = characterIds.length ? (await base44.entities.Character.filter({ campaign_id: campaignId, id: { $in: characterIds } }, {
    limit: 50, fields: ['name', 'archetype', 'race', 'portrait_url', 'stats', 'hp', 'background', 'abilities'],
  })).items : [];
  return { ...page, items: page.items.map((device) => {
    const member = members.find((item) => item.id === device.party_member_id);
    const character = characters.find((item) => item.id === member?.character_id);
    return { device_id: device.id, code: device.device_id, label: device.label, member: member ? {
      id: member.id, name: character?.name || member.name, character_id: member.character_id,
      current_hp: member.current_hp, max_hp: member.max_hp, status: member.status,
      conditions: member.conditions || [], resources: member.resources || [], kind: member.kind,
    } : null, character: character || null, ready: !!character && !!member && member.status === 'active' };
  }) };
}