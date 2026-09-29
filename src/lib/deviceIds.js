export function normalizeDeviceId(raw) {
  if (!raw) return "";
  if (raw.includes("=")) return raw.split("=").pop();
  return raw;
}

export function genHex(len) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}

export function deviceIdLength(type) {
  return type === "terminal" ? 8 : 16;
}

export function deviceLink(type, id) {
  const key = type === "terminal" ? "TerminalID" : type === "gamedisplay" ? "GameDispID" : "GameID";
  const path = type === "terminal" ? "terminal" : type === "gamedisplay" ? "gamedisplay" : "game";
  return `/sys/${path}/${key}=${id}`;
}