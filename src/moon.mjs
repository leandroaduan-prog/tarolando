// Fase da lua, para a previsão de pororoca (marés de lua cheia e nova).
const S = 29.530588853;
export function moonAge(d) {
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  return ((((d.getTime() - ref) / 864e5) % S) + S) % S;
}
export function moonInfo(d) {
  const a = moonAge(d), dn = Math.min(a, S - a), df = Math.abs(a - S / 2);
  const name = dn < 1.85 ? "Lua nova" : df < 1.85 ? "Lua cheia"
    : a < S / 2 ? (a > 5.5 && a < 9.2 ? "Quarto crescente" : "Crescente")
    : (a > 20.3 && a < 24 ? "Quarto minguante" : "Minguante");
  return { a, name, spring: Math.min(dn, df) <= 2.5, lit: (1 - Math.cos((2 * Math.PI * a) / S)) / 2, waxing: a < S / 2 };
}
// Desenho visto do hemisfério sul: lua crescente iluminada à esquerda
export function moonSVG(m) {
  const rx = Math.abs(1 - 2 * m.lit) * 10, left = m.waxing, os = left ? 0 : 1, ts = left ? (m.lit < 0.5 ? 1 : 0) : (m.lit < 0.5 ? 0 : 1);
  return `<svg width="22" height="22" viewBox="-11 -11 22 22" aria-hidden="true"><circle r="10" fill="var(--surface-2)" stroke="var(--muted)" stroke-width="1"/><path d="M0 -10 A10 10 0 0 ${os} 0 10 A${rx.toFixed(2)} 10 0 0 ${ts} 0 -10Z" fill="#F2D27A"/></svg>`;
}
