// Abonnements- og betalingslogikk — foreløpig DEAKTIVERT (testfase).
// Alt er gratis for brukerne. Denne modulen bygger den underliggende logikken
// for fremtidige abonnementer, "Campaign Credits" og betalingsnivåer,
// men lar den ligge i bakgrunnen som "kommer snart" inntil betaling slås på.

export const PAYMENTS_ENABLED = false;

// Midlertidig gratis-kvote: alle innloggede brukere kan ha inntil 10 aktive kampanjer.
export const FREE_TEST_QUOTA = 10;

// Papirkurv: antall dager før permanent sletting.
export const TRASH_RETENTION_DAYS = 30;

// Fremtidige abonnementsnivåer (vises som "Kommer snart" i panelet).
export const TIERS = [
  {
    id: "free",
    name: "Gratis",
    campaigns: 1,
    price: "0 kr",
    blurb: "Én aktiv kampanje. I testfasen: inntil 10 gratis.",
    upcoming: false,
  },
  {
    id: "bard",
    name: "Bard",
    campaigns: 3,
    price: "—",
    blurb: "Opptil 3 aktive kampanjer + lenke-deling med roller.",
    upcoming: true,
  },
  {
    id: "archmage",
    name: "Arkimagus",
    campaigns: 10,
    price: "—",
    blurb: "Opptil 10 kampanjer, Campaign Credits, avansert deling og skjermvisning.",
    upcoming: true,
  },
];

// Gjeldende maksgrense for aktive kampanjer. I testfasen = gratis-kvote.
export function campaignLimit() {
  if (PAYMENTS_ENABLED) {
    // Fremtid: hent brukerens nivå og returner tilhørende antall.
    return FREE_TEST_QUOTA;
  }
  return FREE_TEST_QUOTA;
}

export const PLAY_MODES = [
  { id: "digital", name: "Digital", icon: "Monitor", desc: "Hele kampanjen spilles på skjerm." },
  { id: "physical", name: "Fysisk", desc: "Bord, brikker og papir – GM bruker appen som verktøy.", icon: "Dices" },
  { id: "hybrid", name: "Hybrid", desc: "Fysisk rundt bordet + felles skjermvisning for poeng og oversikt.", icon: "Laptop" },
];