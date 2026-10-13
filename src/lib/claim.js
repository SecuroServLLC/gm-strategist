import { base44 } from "@/api/base44Client";

export async function claimCharacter(device, character, campaign) {
  if (!campaign?.id || !device?.id || !character?.id) throw new Error("Mangler data for claim");

  let partyMember;
  const existing = await base44.entities.PartyMember.filter({
    campaign_id: campaign.id,
    character_id: character.id,
  });
  if (existing.length) {
    partyMember = existing[0];
  } else {
    partyMember = await base44.entities.PartyMember.create({
      campaign_id: campaign.id,
      character_id: character.id,
      name: character.name,
      kind: "character",
      status: "active",
      max_hp: character.hp ?? null,
      current_hp: character.hp ?? null,
    });
  }

  await base44.entities.Character.updateMany({ id: character.id, campaign_id: campaign.id, claim_status: 'open' }, { $set: {
    claim_status: 'claimed', claimed_by: partyMember.id, claim_device_id: device.id,
  } });
  const reserved = await base44.entities.Character.get(character.id);
  if (reserved.claim_device_id !== device.id || reserved.claim_status !== 'claimed') throw new Error('En annen spiller har valgt denne karakteren. Velg en annen.');
  await base44.entities.Device.update(device.id, { party_member_id: partyMember.id });

  return partyMember;
}

export async function releaseCharacter(device, character) {
  if (device?.party_member_id && character?.id) {
    await base44.entities.Character.updateMany({ id: character.id, claimed_by: device.party_member_id }, { $set: { claim_status: 'open', claimed_by: '', claim_device_id: '' } });
  }
  if (device?.id) {
    await base44.entities.Device.update(device.id, { party_member_id: null });
  }
}