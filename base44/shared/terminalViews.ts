export const characterFields = ['name', 'archetype', 'race', 'portrait_url', 'hp', 'stats', 'background', 'abilities'];
const pick = (record, fields) => record ? Object.fromEntries(['id', ...fields].map((key) => [key, record[key]])) : null;

export async function terminalState(entities, device) {
  const result = { device: pick(device, ['device_id', 'label', 'status', 'campaign_id', 'party_member_id']), active: false, campaign: null, member: null, character: null };
  if (device.status !== 'active' || !device.campaign_id) return result;
  const campaign = await entities.Campaign.get(device.campaign_id);
  if (!campaign || campaign.trashed) return result;
  result.active = true;
  result.campaign = pick(campaign, ['title', 'attributes']);
  if (!device.party_member_id) return result;
  const memberPage = await entities.PartyMember.filter({ id: device.party_member_id, campaign_id: campaign.id }, { limit: 1 });
  const member = memberPage.items[0];
  if (!member?.character_id) return result;
  const characterPage = await entities.Character.filter({ id: member.character_id, campaign_id: campaign.id }, { limit: 1, fields: characterFields });
  result.character = characterPage.items[0] || null;
  result.member = pick(member, ['name', 'character_id', 'current_hp', 'max_hp', 'status', 'conditions', 'resources']);
  return result;
}

export async function terminalPage(entities, device, operation, cursor) {
  const query = { campaign_id: device.campaign_id };
  const options = { limit: 24, cursor };
  if (operation === 'characters') return entities.Character.filter({ ...query, claim_status: 'open', role: { $ne: 'antagonist' } }, { ...options, sort: 'name', fields: characterFields });
  if (operation === 'inventory') return entities.InventoryItem.filter({ ...query, $or: [{ carried_by: device.party_member_id }, { carried_by: { $in: ['', null] } }, { carried_by: { $exists: false } }] }, { ...options, sort: 'name', fields: ['name', 'category', 'quantity', 'unit', 'carried_by', 'description'] });
  if (operation === 'log') return entities.SessionEvent.filter(query, { ...options, sort: '-created_date', fields: ['kind', 'text', 'created_date'] });
  const page = await entities.MapItem.filter(query, { ...options, sort: '-updated_date', fields: ['title', 'sketch_url', 'interactive_state'] });
  return { ...page, items: page.items.map((map) => {
    const state = { fog_enabled: false, revealed: [], markers: [], ...map.interactive_state };
    return { ...map, interactive_state: { ...state, markers: state.markers.filter((marker) => !state.fog_enabled || state.revealed.includes(Math.min(14, Math.floor(marker.y * 15 / 100)) * 20 + Math.min(19, Math.floor(marker.x * 20 / 100)))) } };
  }) };
}