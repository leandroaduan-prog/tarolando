// Nota do pico, comentário, janelas de surf e de vento.

export const COND = [
  ["Flat", "s0"], ["Marolinha", "s1"], ["Dá pra brincar", "s2"], ["Tá bom", "s3"], ["Clássico", "s4"], ["Mexido", "bad"]
];
export const RANK = s => (s === 5 ? 0.5 : s);
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 5); // 5h às 19h

const DIRS = ["N","NNE","NE","ENE","L","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
export const card16 = d => DIRS[Math.round((((d % 360) + 360) % 360) / 22.5) % 16];
export const adiff = (a, b) => { const d = Math.abs((((a - b) % 360) + 360) % 360); return d > 180 ? 360 - d : d; };
export const fmt = (n, d = 1) => (n == null || isNaN(n) ? "–" : n.toFixed(d).replace(".", ","));
export function hhmm(h) {
  const H = Math.floor(h), M = Math.round((h - H) * 60);
  const mm = M === 60 ? 0 : M, HH = M === 60 ? H + 1 : H;
  return HH + "h" + (mm ? String(mm).padStart(2, "0") : "");
}

/* Quanto do swell chega na praia, pela direção */
export function exposure(face, dir) {
  const d = adiff(face, dir);
  return d <= 30 ? 1 : d <= 60 ? 0.85 : d <= 90 ? 0.55 : 0.25;
}
export function windKind(face, dir, spd) {
  if (spd < 5) return "sem vento";
  if (adiff(dir, (face + 180) % 360) <= 50) return "terral";
  if (adiff(dir, face) <= 60) return "maral";
  return "lateral";
}
/* Nota do pico. Separa TAMANHO de QUALIDADE:
   - o tamanho dá a nota "possível" (marolinha, dá pra brincar, tá bom, clássico)
   - período curto e vento ruim tiram pontos
   - se o mar tem tamanho mas perdeu 1 nível ou mais por vento/período, vira "Mexido" (e não "Marolinha") */
export function quality(H, per, kind, spd) {
  if (H < 0.3) return { size: 0, q: 0 };
  let size = H < 0.6 ? 1 : H < 1 ? 2 : H < 1.8 ? 3 : 3.5;
  let adj = 0;
  if (per >= 12) adj += 0.7; else if (per >= 10) adj += 0.4; else if (per < 6) adj -= 1.0; else if (per < 8) adj -= 0.6;
  if (kind === "terral" || kind === "sem vento") { if (spd < 25) adj += 0.4; }
  else if (kind === "lateral") adj -= 0.03 * Math.max(0, spd - 8);
  else if (kind === "maral") adj -= 0.08 * Math.max(0, spd - 4);
  return { size, q: Math.max(0, Math.min(4.5, size + adj)) };
}
export function score(H, per, kind, spd) {
  if (H < 0.3) return 0;
  const { size, q } = quality(H, per, kind, spd);
  const ventoForte = (kind === "maral" && spd > 15) || (kind === "lateral" && spd > 24);
  if (H >= 0.6 && (ventoForte || size - q >= 1)) return 5; // tem onda, mas está mexido
  if (q < 1.5) return 1;
  if (q < 2.5) return 2;
  if (q < 3.5) return 3;
  return 4;
}
/* Explica a nota em poucas palavras (ex.: "período curto e vento maral") */
export function motivo(x) {
  const r = [];
  if (x.per && x.per < 8) r.push("período curto");
  else if (x.per >= 11) r.push("ondulação de período longo");
  if (x.kind === "maral" && x.spd >= 8) r.push("vento maral");
  else if (x.kind === "lateral" && x.spd >= 15) r.push("vento lateral forte");
  else if (x.kind === "terral") r.push("vento terral");
  else if (x.kind === "sem vento") r.push("sem vento");
  if (!r.length) return "";
  const t = r.join(" e ");
  return x.s === 5 ? `Tem onda, mas com ${t}: mar mexido` : t.charAt(0).toUpperCase() + t.slice(1);
}
/* Comentário de cada situação */
export function say(s) {
  if (s === 0) return ["Vai pescar", false];
  if (s === 5) return ["Esquece", true];
  if (s === 1) return ["Força a barra", false];
  if (s === 2) return ["De boa", false];
  return ["Altas", false];
}
export function bestWindow(hs) {
  const mr = Math.max(...hs.map(x => RANK(x.s)));
  const i = hs.findIndex(x => RANK(x.s) === mr);
  let j = i;
  while (j + 1 < hs.length && RANK(hs[j + 1].s) === mr) j++;
  const seg = hs.slice(i, j + 1), at = seg.reduce((a, b) => (b.H > a.H ? b : a), seg[0]);
  return { mx: hs[i].s, r: mr, from: hs[i].h, to: hs[j].h + 1, at };
}
export function windWindow(hs) {
  const ok = x => x.kind === "terral" || x.kind === "sem vento" || (x.kind === "lateral" && x.spd < 10);
  let best = null, i = 0;
  while (i < hs.length) {
    if (!ok(hs[i])) { i++; continue; }
    let j = i;
    while (j + 1 < hs.length && ok(hs[j + 1])) j++;
    if (!best || j - i > best.j - best.i) best = { i, j };
    i = j + 1;
  }
  if (!best) return null;
  const a = hs[best.i];
  return { from: hs[best.i].h, to: hs[best.j].h + 1, dir: a.dir, spd: a.spd, kind: a.kind };
}
/* Top moment: as 3 melhores horas seguidas dentro da melhor janela */
export function topMoment(hs, bw) {
  const win = hs.filter(x => x.h >= bw.from && x.h < bw.to);
  if (win.length <= 3) return { from: bw.from, to: bw.to, at: bw.at };
  // prefere horas com vento a favor; vento maral pesa contra
  const v = x => x.H + (x.kind === "terral" || x.kind === "sem vento" ? 0.5 : 0) - (x.kind === "maral" ? 0.06 * x.spd : x.kind === "lateral" ? 0.02 * x.spd : 0);
  let bi = 0, bs = -1e9;
  for (let i = 0; i + 3 <= win.length; i++) {
    const t = v(win[i]) + v(win[i + 1]) + v(win[i + 2]);
    if (t > bs) { bs = t; bi = i; }
  }
  const at = [win[bi], win[bi + 1], win[bi + 2]].sort((a, b) => b.H - a.H)[0];
  return { from: win[bi].h, to: win[bi].h + 3, at };
}
export function roupa(t) {
  if (t == null) return "–";
  return t < 17 ? "Long 4/3 mm" : t < 19 ? "Long 3/2 mm" : t < 21 ? "Long 2 mm ou long john" : t < 24 ? "Short john ou lycra" : "Bermuda e lycra";
}
export function windTxt(x) { return x.kind === "sem vento" ? "Sem vento" : `${Math.round(x.spd)} km/h ${card16(x.dir)}`; }
