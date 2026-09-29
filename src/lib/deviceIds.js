const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // unngår tvetydige I, O, 0, 1

export function normalizeDeviceId(raw) {
  if (!raw) return "";
  if (raw.includes("=")) return raw.split("=").pop();
  return raw;
}

export function genCode(len = 4) {
  let out = "";
  for (let i = 0; i < len; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

export function genHex(len) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}

export function genDeviceId(type) {
  return type === "terminal" ? genCode(4) : genHex(16);
}

export function deviceLink(type, id) {
  const key = type === "terminal" ? "TerminalID" : type === "gamedisplay" ? "GameDispID" : "GameID";
  const path = type === "terminal" ? "terminal" : type === "gamedisplay" ? "gamedisplay" : "game";
  return `/sys/${path}/${key}=${id}`;
}