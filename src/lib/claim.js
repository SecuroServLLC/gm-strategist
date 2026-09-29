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

  await base44.entities.Device.update(device.id, { party_member_id: partyMember.id });
  await base44.entities.Character.update(character.id, {
    claim_status: "claimed",
    claimed_by: partyMember.id,
  });

  return partyMember;
}

export async function releaseCharacter(device, character) {
  if (device?.party_member_id && character?.id) {
    await base44.entities.Character.update(character.id, { claim_status: "open", claimed_by: null });
  }
  if (device?.id) {
    await base44.entities.Device.update(device.id, { party_member_id: null });
  }
}