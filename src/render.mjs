// Modelos das páginas do site.
import { readFileSync } from "node:fs";
import { COND, RANK, card16, fmt, hhmm, say, roupa, windTxt } from "./rating.mjs";
import { UFN, FLAG } from "./picos.mjs";
import { moonInfo, moonSVG } from "./moon.mjs";

const LOGO = readFileSync(new URL("./logo.svg.txt", import.meta.url), "utf8");
const BGWAVE = readFileSync(new URL("./bgwave.svg.txt", import.meta.url), "utf8");
const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WDL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const SKY = { sol: "Sol", parcial: "Sol entre nuvens", nublado: "Nublado", chuva: "Chuva", tempestade: "Tempestade" };

export const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const picoPath = p => `/${p.ufSlug}/${p.cidadeSlug}/${p.slug}/`;
export const cityPath = p => `/${p.ufSlug}/${p.cidadeSlug}/`;
export const ufPath = uf => `/${uf.toLowerCase()}/`;

let C; // contexto do build
export function setContext(ctx) { C = ctx; }
const u = path => C.base + path;

/* ---------- datas ---------- */
const dt = s => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };
const ddmm = s => s.slice(8, 10) + "/" + s.slice(5, 7);
export const dayShort = (s, i) => (i === 0 ? "Hoje" : WD[dt(s).getUTCDay()]);
export const dayName = (s, i) => (i === 0 ? "Hoje" : i === 1 ? "Amanhã" : WD[dt(s).getUTCDay()]);
export const dayLong = (s, i) => (i === 0 ? "Hoje" : i === 1 ? "Amanhã" : WDL[dt(s).getUTCDay()]);

/* ---------- peças ---------- */
export const color = s => `var(--${COND[s][1]})`;
export function pill(s) {
  const on = s === 5 ? 1 : s;
  return `<span class="pill" style="--sc:${color(s)}"><span class="meter" aria-hidden="true">${[1, 2, 3, 4].map(k => `<i class="${k <= on ? "on" : ""}"></i>`).join("")}</span>${COND[s][0]}</span>`;
}
export function sayHTML(s) { const [t, bad] = say(s); return `<span class="say${bad ? " bad" : ""}">${t}</span>`; }
export function wxIcon(sky, size) {
  const sun = `<circle cx="16" cy="16" r="6" fill="#F2B233"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="16" y1="5" x2="16" y2="8" stroke="#F2B233" stroke-width="2" stroke-linecap="round" transform="rotate(${a} 16 16)"/>`).join("")}`;
  const cloud = (x, y, c) => `<path d="M${x} ${y}h14a5 5 0 0 0 0-10 7 7 0 0 0-13-1 5 5 0 0 0-1 11z" fill="${c}"/>`;
  const g = sky === "sol" ? sun : sky === "parcial" ? `<g transform="translate(-4 -4)">${sun}</g>${cloud(9, 26, "#C9D6DB")}` : sky === "nublado" ? cloud(6, 22, "#9FB2BA") + cloud(10, 27, "#C9D6DB")
    : cloud(7, 20, "#9FB2BA") + `<path d="M11 24l-2 5M17 24l-2 5M23 24l-2 5" stroke="#4F9FCF" stroke-width="2" stroke-linecap="round"/>`;
  return `<svg ${size ? `width="${size}" height="${size}"` : ""} viewBox="0 0 32 32" aria-hidden="true">${g}</svg>`;
}
const windPh = x => (x.kind === "sem vento" ? "sem vento" : `vento ${windTxt(x)} (${x.kind})`);
function windWinTxt(w) {
  if (!w) return "Sem horário de vento a favor";
  return `Vento a favor: <b>${hhmm(w.from)} às ${hhmm(w.to)}</b> · ${w.kind === "sem vento" ? "sem vento" : w.kind === "terral" ? `terral ${card16(w.dir)} ${Math.round(w.spd)} km/h` : "vento fraco"}`;
}
function flagTags(p) { return [...p.flags].filter(k => FLAG[k]).map(k => `<span class="tag flag-${k}">${FLAG[k][0]}</span>`).join(" "); }
function favBtn(p) {
  return `<button class="fav" type="button" aria-pressed="false" data-fav="${p.id}" aria-label="Favoritar ${esc(p.nome)}"><svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></button>`;
}
function adSlot(name) {
  const a = C.config.ads;
  if (!a.enabled || !a.client) return "";
  const slot = a.slots?.[name];
  return `<ins class="adsbygoogle ad-slot" style="display:block" data-ad-client="${esc(a.client)}"${slot ? ` data-ad-slot="${esc(slot)}"` : ""} data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>`;
}
const legend = () => {
  const ex = [["Clássico", "Altas", "s4"], ["Tá bom", "Altas", "s3"], ["Dá pra brincar", "De boa", "s2"], ["Marolinha", "Força a barra", "s1"], ["Flat", "Vai pescar", "s0"], ["Mexido", "Esquece", "bad"]];
  return `<div class="legend">${ex.map(([a, b, c]) => `<span><i style="--sc:var(--${c})"></i>${a}: “${b}”</span>`).join("")}</div>`;
};

/* ---------- gráficos ---------- */
function hourChart(hs) {
  const W = 360, base = 110, top = 16, step = (W - 20) / hs.length, max = Math.max(1.5, ...hs.map(x => x.H)) * 1.1;
  let s = `<svg class="chart" viewBox="0 0 ${W} 170" role="img" aria-label="Altura da onda e vento hora a hora"><line x1="10" x2="${W - 10}" y1="${base}" y2="${base}" stroke="var(--line)"/>`;
  hs.forEach((x, i) => {
    const cx = 10 + step * i + step / 2, bh = Math.max(2, (x.H / max) * (base - top - 12));
    s += `<rect x="${(cx - step * 0.36).toFixed(1)}" y="${(base - bh).toFixed(1)}" width="${(step * 0.72).toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${color(x.s)}"/>`;
    s += `<text class="val" x="${cx.toFixed(1)}" y="${(base - bh - 4).toFixed(1)}" text-anchor="middle">${fmt(x.H)}</text>`;
    if (i % 2 === 0) s += `<text x="${cx.toFixed(1)}" y="${base + 13}" text-anchor="middle">${x.h}h</text>`;
    const col = x.kind === "terral" ? "var(--s3)" : x.kind === "maral" ? "var(--accent)" : "var(--muted)";
    s += `<g transform="translate(${cx.toFixed(1)} ${base + 32}) rotate(${Math.round((x.dir + 180) % 360)})"><path d="M0 -7 L4 4 L0 1.5 L-4 4 Z" fill="${col}"/></g>`;
    s += `<text x="${cx.toFixed(1)}" y="${base + 52}" text-anchor="middle">${Math.round(x.spd)}</text>`;
  });
  return s + `<text x="10" y="10">Onda (m)</text><text x="${W - 10}" y="10" text-anchor="end">Vento (km/h) embaixo</text></svg>`;
}
function tideChart(tide) {
  const { pts, ext } = tide;
  if (pts.length < 6) return `<p class="muted">Sem dados de maré para este dia.</p>`;
  const W = 360, l = 10, r = W - 10, t = 20, b = 90, vs = pts.map(p => p.v), mn = Math.min(...vs) - 0.1, mx = Math.max(...vs) + 0.1;
  const X = h => l + (h / 24) * (r - l), Y = v => b - ((v - mn) / (mx - mn)) * (b - t);
  const d = pts.map((p, i) => (i ? "L" : "M") + X(p.h).toFixed(1) + " " + Y(p.v).toFixed(1)).join(" ");
  let s = `<svg class="chart" viewBox="0 0 ${W} 120" role="img" aria-label="Curva da maré"><path d="${d} L${X(pts.at(-1).h).toFixed(1)} ${b} L${X(pts[0].h).toFixed(1)} ${b} Z" fill="var(--sea-soft)"/><path d="${d}" fill="none" stroke="var(--sea)" stroke-width="2"/>`;
  [0, 6, 12, 18, 24].forEach(h => (s += `<text x="${X(h)}" y="${b + 14}" text-anchor="${h === 0 ? "start" : h === 24 ? "end" : "middle"}">${h}h</text>`));
  ext.filter(e => e.h > 0.6 && e.h < 23.4).forEach(e => (s += `<circle cx="${X(e.h).toFixed(1)}" cy="${Y(e.v).toFixed(1)}" r="3.5" fill="var(--sea)"/><text class="val" x="${X(e.h).toFixed(1)}" y="${(e.t === "Alta" ? Y(e.v) - 7 : Y(e.v) + 14).toFixed(1)}" text-anchor="middle">${fmt(e.v)}</text>`));
  return s + `</svg>`;
}
function weekBars(p, opts = {}) {
  const ds = p.days, mh = Math.max(1, ...ds.map(d => d.bw.at.H));
  return ds.map((d, i) => {
    const inner = `<span class="h">${fmt(d.bw.at.H)}</span><span class="bar" style="--sc:${color(d.bw.mx)};height:${(8 + (opts.h || 40) * (d.bw.at.H / mh)).toFixed(0)}px"></span>${opts.icons ? wxIcon(d.wx.sky, 18) : ""}<span class="d">${dayShort(d.date, i)}</span>`;
    return opts.go ? `<button type="button" data-go="${i + 1}" class="${i === opts.best ? "best" : ""}" aria-label="${dayLong(d.date, i)}: ${COND[d.bw.mx][0]}">${inner}</button>` : `<div>${inner}</div>`;
  }).join("");
}
function mini8(p) {
  const mh = Math.max(1, ...p.days.map(d => d.bw.at.H));
  return `<div class="mini8" aria-hidden="true">${p.days.map(d => `<i style="--sc:${color(d.bw.mx)};height:${(6 + 28 * (d.bw.at.H / mh)).toFixed(0)}px"></i>`).join("")}</div><div class="mini8-l" aria-hidden="true">${p.days.map((d, i) => `<span>${dayShort(d.date, i)}</span>`).join("")}</div>`;
}

/* ---------- seleção ---------- */
export function bestOf(list, di) {
  let b = null;
  for (const p of list) { const d = p.days[di]; if (!d.bw) continue; if (!b || d.bw.r > b.d.bw.r || (d.bw.r === b.d.bw.r && d.bw.at.H > b.d.bw.at.H)) b = { p, d }; }
  return b;
}
const waves = list => list.filter(p => !p.poro && !p.noWaves);

/* ---------- carrossel (resumo + 8 dias) ---------- */
function carousel(list, label) {
  const ws = waves(list);
  if (!ws.length) return `<article class="panel"><p class="label">${esc(label)}</p><div class="name">Sem previsão de ondas do mar</div><p class="soft" style="position:relative;margin:0">Aqui o surf é na pororoca. Veja a previsão pela lua abaixo.</p></article>`;
  const bests = C.dates.map((_, i) => bestOf(ws, i));
  let bi = 0; bests.forEach((b, i) => { const c = bests[bi]; if (b.d.bw.r > c.d.bw.r || (b.d.bw.r === c.d.bw.r && b.d.bw.at.H > c.d.bw.at.H)) bi = i; });
  const B = bests[bi], mh = Math.max(1, ...bests.map(b => b.d.bw.at.H));
  const sum = `<article class="panel sum" aria-label="Resumo da semana">
    <p class="label">Resumo dos próximos 8 dias · ${esc(label)}</p>
    <div class="line soft">Melhor dia</div>
    <div class="name">${dayLong(B.d.date, bi)}${bi > 1 ? " " + ddmm(B.d.date) : ""}</div>
    <div class="line">${pill(B.d.bw.mx)}${sayHTML(B.d.bw.mx)}</div>
    <div class="line soft"><a href="${u(picoPath(B.p))}" style="color:inherit">${esc(B.p.nome)}</a> · ${hhmm(B.d.bw.from)} às ${hhmm(B.d.bw.to)} · ${fmt(B.d.bw.at.H)} m · ${B.d.bw.at.per}s</div>
    <div class="windok">${windWinTxt(B.d.ww)}</div>
    <div class="week">${bests.map((b, i) => `<button type="button" data-go="${i + 1}" class="${i === bi ? "best" : ""}" aria-label="${dayLong(b.d.date, i)}: ${COND[b.d.bw.mx][0]}"><span class="h">${fmt(b.d.bw.at.H)}</span><span class="bar" style="--sc:${color(b.d.bw.mx)};height:${(8 + 46 * (b.d.bw.at.H / mh)).toFixed(0)}px"></span>${wxIcon(b.d.wx.sky, 18)}<span class="d">${dayShort(b.d.date, i)}</span></button>`).join("")}</div>
  </article>`;
  const days = bests.map((b, i) => {
    const d = b.d, hi = d.tide.ext.filter(x => x.t === "Alta").map(x => hhmm(x.h)).join(" e ");
    return `<article class="panel" aria-label="${dayLong(d.date, i)} ${ddmm(d.date)}">
      <p class="label">${dayLong(d.date, i)} · ${ddmm(d.date)} · ${esc(label)}</p>
      <div class="wx">${wxIcon(d.wx.sky)}<span>${SKY[d.wx.sky]} · ${Math.round(d.wx.tmax)}° / ${Math.round(d.wx.tmin)}° · chuva ${d.wx.rain ?? 0}%</span></div>
      <div class="line soft">Onde tá melhor</div>
      <div class="name">${esc(b.p.nome)}</div>
      <div class="line">${pill(d.bw.mx)}${sayHTML(d.bw.mx)}</div>
      <div class="line soft">${hhmm(d.bw.from)} às ${hhmm(d.bw.to)} · ${fmt(d.bw.at.H)} m · ${d.bw.at.per}s de ${card16(d.bw.at.swDir)}${hi ? ` · maré alta ${hi}` : ""}</div>
      <div class="windok">${windWinTxt(d.ww)}</div>
      <a class="go" href="${u(picoPath(b.p))}#dia-${i}">Ver ${esc(b.p.nome)}</a>
      ${BGWAVE}</article>`;
  });
  const tabs = ["Resumo", ...C.dates.map((d, i) => dayName(d, i) + " " + d.slice(8, 10))];
  return `<div class="scroller" id="tabs">${tabs.map((t, i) => `<button class="chip" type="button" data-go="${i}" aria-pressed="${i === 0}">${t}</button>`).join("")}</div>
    <div class="carousel" id="carousel">${sum}${days.join("")}</div>
    <div class="dots" id="dots" aria-hidden="true">${tabs.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</div>`;
}

/* ---------- cartão de pico (hoje) ---------- */
function card(p, opts = {}) {
  if (p.poro) return poroCard(p);
  if (p.noWaves) return `<li class="card"><a class="card-main" href="${u(picoPath(p))}"><div class="card-top"><h3>${esc(p.nome)}</h3><div class="city">${esc(p.cidade)} · ${p.uf}</div></div><p class="muted" style="margin:0">Sem dados de onda no momento.</p></a>${favBtn(p)}</li>`;
  const d = p.days[0], a = d.bw.at, hi = d.tide.ext.filter(x => x.t === "Alta").map(x => hhmm(x.h)).join(" e ");
  return `<li class="card"><a class="card-main" href="${u(picoPath(p))}">
    <div class="card-top"><h3>${esc(p.nome)}</h3><div class="city">${esc(p.cidade)} · ${p.uf}${opts.km != null ? ` · ${Math.round(opts.km)} km` : ""} · <span class="tag">${p.nivel}</span> ${flagTags(p)}</div></div>
    <div class="row">${pill(d.bw.mx)}${sayHTML(d.bw.mx)}</div>
    <div class="stats">
      <div class="stat"><span>Ondulação</span><b>${fmt(a.H)} m · ${a.per}s<br>${card16(a.swDir)}</b></div>
      <div class="stat"><span>Vento</span><b>${windTxt(a)}${a.kind !== "sem vento" ? "<br>" + a.kind : ""}</b></div>
      <div class="stat"><span>Maré alta</span><b>${hi || "–"}</b></div>
    </div>
    <div class="window">Hoje, melhor janela: <strong>${hhmm(d.bw.from)} às ${hhmm(d.bw.to)}</strong>.<br>${d.ww ? `Vento a favor: <strong>${hhmm(d.ww.from)} às ${hhmm(d.ww.to)}</strong>` : "Sem horário de vento a favor"}</div>
    ${mini8(p)}
  </a>${favBtn(p)}</li>`;
}
function poroDays() {
  return C.dates.map((s, i) => ({ s, i, m: moonInfo(dt(s)) }));
}
function poroCard(p) {
  const ms = poroDays(), season = dt(C.dates[0]).getUTCMonth() <= 3;
  return `<li class="card"><a class="card-main" href="${u(picoPath(p))}">
    <div class="card-top"><h3>${esc(p.nome)}</h3><div class="city">${esc(p.cidade)} · ${p.uf} · <span class="tag">Pororoca</span></div></div>
    <p style="margin:0">${esc(p.dica)}</p>
    <div class="poro-days">${ms.map(x => `<div><b>${dayShort(x.s, x.i)}</b>${moonSVG(x.m)}<span class="${x.m.spring ? "yes" : "muted"}">${x.m.spring ? "Pode rolar" : "Fraca"}</span></div>`).join("")}</div>
    <div class="window">Hoje: <strong>${ms[0].m.name}</strong>. ${season ? "Temporada forte (fevereiro a abril)." : "A temporada mais forte vai de fevereiro a abril."}</div>
  </a></li>`;
}

/* ---------- layout ---------- */
export function layout({ title, desc, path, body, jsonld = [], crumbs = [] }) {
  const url = C.siteUrl + path;
  const ads = C.config.ads.enabled && C.config.ads.client ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(C.config.ads.client)}" crossorigin="anonymous"></script>` : "";
  const bc = crumbs.length ? [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c[0], item: C.siteUrl + c[1] })) }] : [];
  const ld = [...jsonld, ...bc].map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("");
  return `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Tá Rolando?"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}"><meta property="og:locale" content="pt_BR">
<meta name="theme-color" content="#0F2733">
<link rel="icon" href="${u("/icons/icon-192.png")}" type="image/png">
<link rel="manifest" href="${u("/manifest.webmanifest")}">
<link rel="apple-touch-icon" href="${u("/icons/apple-touch-icon.png")}">
<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Tá Rolando"><meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Figtree:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${u("/style.css?v=" + C.version)}">
${ads}${ld}
</head><body><div class="wrap">
<header class="site-head"><a class="home" href="${u("/")}" aria-label="Tá Rolando? página inicial"><img class="logo-mark" src="${u("/icons/logo-mark.png")}" alt="" width="58" height="52">${LOGO}</a>
<button class="place" id="place" type="button" aria-label="Escolha seu pico"><span class="pin"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="10" r="2.6" fill="currentColor"/></svg></span><span class="place-txt"><b>Escolha seu pico</b><small>Por estado, cidade ou perto de você</small></span><span class="chev" aria-hidden="true">›</span></button>
</header>
<a class="install-tag" id="install-tag" href="#install" hidden><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Baixe o app grátis: role até o fim da página</a>
${crumbs.length > 1 ? `<nav aria-label="Você está em"><ol class="crumbs">${crumbs.map((c, i) => `<li>${i === crumbs.length - 1 ? esc(c[0]) : `<a href="${u(c[1])}">${esc(c[0])}</a>`}</li>`).join("")}</ol></nav>` : ""}
${body}
<section class="install" id="install" hidden>
  <img src="${u("/icons/icon-192.png")}" alt="" width="48" height="48">
  <div><b>Leve o Tá Rolando no celular</b><small>Instale o app: abre em tela cheia e mostra a última previsão mesmo sem internet.</small></div>
  <div class="install-btns"><button class="btn primary" type="button" id="install-go">Instalar</button><button class="btn" type="button" id="install-no" aria-label="Agora não">Agora não</button></div>
</section>
<footer class="foot">
<nav><a href="${u("/")}">Início</a><a href="${u("/sobre/")}">Sobre</a><a href="${u("/politica-de-privacidade/")}">Política de privacidade</a><a href="${u("/contato/")}">Contato</a></nav>
<p style="margin:0">Previsão de ondas, vento e tempo: <a href="https://open-meteo.com/" rel="noopener">Open-Meteo.com</a> (CC BY 4.0). A maré vem de modelo numérico e é aproximada: não use para navegação. Coordenadas dos picos aproximadas.</p>
<p style="margin:0">Atualizado em ${esc(C.updatedTxt)}. © ${dt(C.dates[0]).getUTCFullYear()} Tá Rolando?</p>
</footer></div>
<div class="sheet" id="sheet" hidden><div class="sheet-in" role="dialog" aria-modal="true" aria-labelledby="sheet-title" id="sheet-in"></div></div>
<script>window.TR={base:${JSON.stringify(C.base)},v:${JSON.stringify(C.version)}};</script>
<script src="${u("/indice.js?v=" + C.version)}" defer></script><script src="${u("/app.js?v=" + C.version)}" defer></script>
</body></html>`;
}

/* ---------- páginas ---------- */
export function homePage(all) {
  const ws = waves(all), top = bestOf(ws, 0);
  const ufs = Object.keys(UFN).filter(uf => all.some(p => p.uf === uf));
  const perUf = ufs.map(uf => ({ uf, b: bestOf(waves(all.filter(p => p.uf === uf)), 0) })).filter(x => x.b);
  const d = top.d, tm = d.top;
  const yourDefault = `<article class="panel sum your" id="your">
    <p class="label">Onde tá melhor hoje no Brasil</p>
    <div class="name"><a href="${u(picoPath(top.p))}" style="color:inherit;text-decoration:none">${esc(top.p.nome)}</a></div>
    <div class="line soft">${esc(top.p.cidade)} · ${top.p.uf}</div>
    <div class="topm"><span class="tm-badge">Top moment de hoje</span><div class="tm-time">${hhmm(tm.from)} às ${hhmm(tm.to)}</div>
      <div class="line">${pill(d.bw.mx)}${sayHTML(d.bw.mx)}</div>
      <div class="line soft">${fmt(tm.at.H)} m · ${tm.at.per}s de ${card16(tm.at.swDir)} · ${windPh(tm.at)}</div></div>
    <div class="windok">${windWinTxt(d.ww)}</div>
    <p class="soft" style="margin:0;position:relative">Toque na estrela de um pico para ver aqui o top moment do seu pico preferido.</p>
  </article>`;
  const body = `
  <section class="layout2">
    <div style="display:grid;gap:10px;min-width:0">${yourDefault}</div>
    <div style="display:grid;gap:10px;min-width:0;align-content:start">
      <h1 class="page">Previsão de surf no Brasil</h1>
      <p class="lead">Ondas, vento, maré e tempo para ${ws.length} picos do litoral brasileiro, de hoje até os próximos 7 dias. Cada pico ganha uma nota fácil de ler e o melhor horário para cair.</p>
      <p class="label" style="margin:6px 0 0">Como ler a nota</p>${legend()}
    </div>
  </section>
  <section id="local" hidden></section>
  ${adSlot("home")}
  <section><h2 class="section-title">Hoje em cada estado</h2><ul class="list">${perUf.map(x => card(x.b.p)).join("")}</ul></section>
  <section><h2 class="section-title">Escolha o estado</h2><ul class="grid-links">${ufs.map(uf => `<li><a href="${u(ufPath(uf))}">${UFN[uf]}<small>${all.filter(p => p.uf === uf).length} picos</small></a></li>`).join("")}</ul></section>
  <section class="pass" id="pass" hidden></section>`;
  return layout({
    title: "Tá Rolando? · Previsão de surf no Brasil: ondas, vento e maré",
    desc: `Previsão de surf para ${all.length} picos do Brasil: ondas, vento, maré e tempo para 8 dias, com nota fácil e o melhor horário para surfar. Hoje tá melhor em ${top.p.nome} (${top.p.uf}).`,
    path: "/", body,
    jsonld: [{ "@context": "https://schema.org", "@type": "WebSite", name: "Tá Rolando?", url: C.siteUrl + "/", inLanguage: "pt-BR" }]
  });
}

function areaPage({ list, title, h1, lead, path, crumbs, label, sideLinks }) {
  const ws = waves(list), poros = list.filter(p => p.poro), sorted = [...ws].sort((a, b) => b.days[0].bw.r - a.days[0].bw.r || b.days[0].bw.at.H - a.days[0].bw.at.H);
  const t = bestOf(ws, 0);
  const body = `
  <section class="layout2">
    <div style="display:grid;gap:10px;min-width:0">${carousel(list, label)}</div>
    <div style="display:grid;gap:10px;min-width:0;align-content:start">
      <h1 class="page">${esc(h1)}</h1><p class="lead">${lead}</p>
      <p class="label" style="margin:6px 0 0">Como ler a nota</p>${legend()}
      <p class="muted" style="margin:0;font-size:.85rem">Arraste os quadros para ver os próximos dias.</p>
      ${sideLinks || ""}
    </div>
  </section>
  ${adSlot("lista")}
  ${sorted.length ? `<section><h2 class="section-title">${sorted.length} ${sorted.length > 1 ? "picos" : "pico"} hoje</h2><ul class="list">${sorted.map(p => card(p)).join("")}</ul></section>` : ""}
  ${poros.length ? `<section><h2 class="section-title">Pororoca</h2><ul class="list">${poros.map(poroCard).join("")}</ul></section>` : ""}`;
  const desc = t ? `${h1}: hoje tá melhor em ${t.p.nome} (${COND[t.d.bw.mx][0]}, ${fmt(t.d.bw.at.H)} m). Ondas, vento, maré e tempo de ${list.length} ${list.length > 1 ? "picos" : "pico"} para 8 dias.` : `${h1}: previsão de pororoca pela fase da lua.`;
  return layout({ title, desc, path, body, crumbs });
}
export function statePage(uf, list) {
  const cities = [...new Map(list.map(p => [p.cidade, p])).values()];
  const side = `<p class="label" style="margin:6px 0 0">Cidades</p><ul class="grid-links">${cities.map(c => `<li><a href="${u(cityPath(c))}">${esc(c.cidade)}<small>${list.filter(p => p.cidade === c.cidade).length}</small></a></li>`).join("")}</ul>`;
  return areaPage({
    list, label: UFN[uf], path: ufPath(uf), sideLinks: side,
    title: `Previsão de surf em ${UFN[uf]} (${uf}): ondas, vento e maré · Tá Rolando?`,
    h1: `Surf em ${UFN[uf]}`,
    lead: `Previsão de ${list.length} picos em ${cities.length} cidades de ${UFN[uf]}, com nota do dia, melhor horário e vento a favor.`,
    crumbs: [["Início", "/"], [UFN[uf], ufPath(uf)]]
  });
}
export function cityPage(list) {
  const p0 = list[0];
  return areaPage({
    list, label: `${p0.cidade} · ${p0.uf}`, path: cityPath(p0),
    title: `Previsão de surf em ${p0.cidade} (${p0.uf}): ondas, vento e maré · Tá Rolando?`,
    h1: `Surf em ${p0.cidade}`,
    lead: `Previsão de ${list.map(p => esc(p.nome)).join(", ")} para hoje e os próximos 7 dias.`,
    crumbs: [["Início", "/"], [UFN[p0.uf], ufPath(p0.uf)], [p0.cidade, cityPath(p0)]]
  });
}

export function picoPage(p, near) {
  const crumbs = [["Início", "/"], [UFN[p.uf], ufPath(p.uf)], [p.cidade, cityPath(p)], [p.nome, picoPath(p)]];
  const place = { "@context": "https://schema.org", "@type": p.poro ? "Place" : "Beach", name: p.nome, address: { "@type": "PostalAddress", addressLocality: p.cidade, addressRegion: p.uf, addressCountry: "BR" }, geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lon } };
  const maps = q => "https://www.google.com/maps/search/" + encodeURIComponent(q);
  const f = p.ficha;
  const ficha = `<div class="block"><h4>Ficha do pico</h4><dl class="ficha"><dt>Nível</dt><dd>${p.nivel}</dd>${f ? `<dt>Fundo</dt><dd>${f[0]}</dd><dt>Melhor swell</dt><dd>${f[1]}</dd><dt>Melhor vento</dt><dd>${f[2]}</dd><dt>Melhor maré</dt><dd>${f[3]}</dd>` : ""}${p.poro ? "" : `<dt>Praia virada p/</dt><dd>${card16(p.face)}</dd>`}</dl>
    ${p.dica && !f ? `<p style="margin:0">${esc(p.dica)}</p>` : ""}${f ? `<p style="margin:0">${f[4]}</p>` : p.poro ? "" : `<p class="muted" style="margin:0">Ficha em construção. Fundo, melhor swell, vento e maré entram com a ajuda dos surfistas locais.</p>`}
    ${[...p.flags].filter(k => FLAG[k]).map(k => `<p class="warn">${FLAG[k][1]}</p>`).join("")}</div>`;
  const links = `<div class="block"><h4>Câmera ao vivo</h4><p class="muted" style="margin:0;font-size:.88rem">As câmeras do litoral são de sites parceiros. Enquanto não temos parcerias, buscamos para você.</p>
    <a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent("câmera ao vivo praia " + p.nome + " " + p.cidade)}">Procurar câmera de ${esc(p.nome)}</a></div>
    <div class="block"><h4>Perto do pico</h4><div class="links">
    <a class="btn" target="_blank" rel="noopener" href="${maps("loja de surf perto de praia " + p.nome + ", " + p.cidade + " " + p.uf)}">Lojas de surf</a>
    <a class="btn" target="_blank" rel="noopener" href="${maps("shaper prancha de surf " + p.cidade + " " + p.uf)}">Shapers</a>
    <a class="btn" target="_blank" rel="noopener" href="${maps("conserto de prancha de surf " + p.cidade + " " + p.uf)}">Conserto de prancha</a>
    <a class="btn" target="_blank" rel="noopener" href="${maps("escola de surf aluguel de prancha praia " + p.nome + ", " + p.cidade)}">Escola e aluguel</a></div></div>`;
  const nearHTML = near.length ? `<section><h2 class="section-title">Picos perto de ${esc(p.nome)}</h2><ul class="grid-links">${near.map(x => `<li><a href="${u(picoPath(x.p))}">${esc(x.p.nome)}<small>${Math.round(x.km)} km</small></a></li>`).join("")}</ul></section>` : "";
  const head = `<div class="row" style="justify-content:space-between;align-items:flex-start"><div><h1 class="page">${esc(p.nome)}</h1><p class="lead">${esc(p.cidade)} · ${UFN[p.uf]} · <span class="tag">${p.nivel}</span> ${flagTags(p)}</p></div><div style="position:relative;width:40px;height:40px">${favBtn(p).replace('class="fav"', 'class="fav" style="top:0;right:0"')}</div></div>`;
  const checkin = `<div class="links" style="margin-top:4px"><button class="btn primary wide" type="button" data-checkin="${p.id}">Surfei aqui hoje</button></div>`;

  if (p.poro) {
    const body = `${head}<ul class="list" style="grid-template-columns:1fr">${poroCard(p).replace(/<a class="card-main"[^>]*>/, '<div class="card-main" style="cursor:default">').replace("</a></li>", "</div></li>")}</ul>
      <div class="block"><h4>Como funciona</h4><p style="margin:0">A pororoca é uma onda que sobe o rio quando a maré enche forte. Ela é maior nas marés de lua cheia e lua nova, e a temporada mais forte costuma ir de fevereiro a abril. Vá sempre com guia local e apoio de barco ou jet-ski.</p></div>
      ${ficha}${checkin}${nearHTML}`;
    return layout({ title: `${p.nome} (${p.cidade}, ${p.uf}): previsão de pororoca pela lua · Tá Rolando?`, desc: `Quando vai ter pororoca em ${p.nome}: fase da lua e marés de sizígia para os próximos 8 dias.`, path: picoPath(p), body, crumbs, jsonld: [place] });
  }
  if (p.noWaves) {
    const body = `${head}<div class="block"><p style="margin:0">Estamos sem dados de onda para este pico agora. Tente de novo mais tarde.</p></div>${ficha}${links}${nearHTML}`;
    return layout({ title: `Previsão de surf em ${p.nome} (${p.cidade}, ${p.uf}) · Tá Rolando?`, desc: `Previsão de surf em ${p.nome}, ${p.cidade} (${p.uf}).`, path: picoPath(p), body, crumbs, jsonld: [place] });
  }
  const d0 = p.days[0], tm = d0.top;
  const tip = s => (s === 5 ? "Mar mexido e vento forte" : p.nivel.startsWith("Iniciante") ? (s <= 3 ? "Bom para iniciantes" : "Mar grande: iniciante só com escola") : s >= 3 ? "Bom para quem já surfa bem" : "Tranquilo para intermediários");
  const daySection = (d, i) => {
    const hi = d.tide.ext;
    return `<section class="day" id="dia-${i}" ${i ? "hidden" : ""} aria-label="${dayLong(d.date, i)} ${ddmm(d.date)}">
      <div class="block"><div class="row">${pill(d.bw.mx)}${sayHTML(d.bw.mx)}</div><div class="muted">${tip(d.bw.mx)}</div>
        <div>Melhor janela: <strong>${hhmm(d.bw.from)} às ${hhmm(d.bw.to)}</strong> · ${fmt(d.bw.at.H)} m, ${d.bw.at.per}s de ${card16(d.bw.at.swDir)} · ${windPh(d.bw.at)}</div></div>
      <div class="block"><h4>Tempo e vento</h4><div class="wxbig">${wxIcon(d.wx.sky)}<div><strong>${SKY[d.wx.sky]}</strong> · ${Math.round(d.wx.tmax)}° / ${Math.round(d.wx.tmin)}°<br><span class="muted">Chance de chuva ${d.wx.rain ?? 0}%</span></div></div>
        <div>${windWinTxt(d.ww)}</div><div class="muted" style="font-size:.85rem">À tarde (17h): ${windTxt(d.hours[12])}${d.hours[12].kind !== "sem vento" ? ` (${d.hours[12].kind})` : ""}${d.hours[12].gust ? `, rajadas de ${Math.round(d.hours[12].gust)} km/h` : ""}</div></div>
      <div class="block"><h4>Hora a hora</h4>${hourChart(d.hours)}<div class="muted" style="font-size:.8rem">Setas mostram para onde o vento sopra. Verde é terral (bom), laranja é maral (ruim).</div></div>
      <div class="block"><h4>Maré (modelo aproximado)</h4>${tideChart(d.tide)}<div class="tides">${hi.map(e => `<span>${e.t} ${hhmm(e.h)} · ${fmt(e.v)} m</span>`).join("")}</div></div>
      ${d.water != null ? `<div class="block"><h4>Água e roupa</h4><div class="water"><span class="t">${fmt(d.water)}°C</span><span>${roupa(d.water)}</span></div></div>` : ""}
    </section>`;
  };
  const body = `${head}
  <section class="layout2">
    <div style="display:grid;gap:10px;min-width:0">
      <article class="panel sum">
        <div class="topm"><span class="tm-badge">Top moment de hoje</span><div class="tm-time">${hhmm(tm.from)} às ${hhmm(tm.to)}</div>
          <div class="line">${pill(d0.bw.mx)}${sayHTML(d0.bw.mx)}</div>
          <div class="line soft">${fmt(tm.at.H)} m · ${tm.at.per}s de ${card16(tm.at.swDir)} · ${windPh(tm.at)}</div>
          ${d0.bw.to - d0.bw.from > 3 ? `<div class="soft" style="font-size:.85rem;position:relative">Janela boa no dia: ${hhmm(d0.bw.from)} às ${hhmm(d0.bw.to)}</div>` : ""}</div>
        <div class="windok">${windWinTxt(d0.ww)}</div>
        <div class="week">${weekBars(p, { go: true, icons: true, h: 46, best: -1 })}</div>
      </article>
    </div>
    <div style="display:grid;gap:10px;min-width:0;align-content:start">
      <p class="lead" style="margin:0">Previsão de surf em ${esc(p.nome)}, ${esc(p.cidade)} (${p.uf}): ondas, vento, maré e tempo para hoje e os próximos 7 dias. Hoje: ${COND[d0.bw.mx][0].toLowerCase()}, ${fmt(d0.bw.at.H)} m com ${d0.bw.at.per}s de período.</p>
      <p class="label" style="margin:6px 0 0">Como ler a nota</p>${legend()}
    </div>
  </section>
  <div class="daytabs" id="daytabs">${p.days.map((d, i) => `<button class="chip" type="button" data-day="${i}" aria-pressed="${i === 0}">${dayName(d.date, i)} ${d.date.slice(8, 10)}</button>`).join("")}</div>
  ${p.days.map(daySection).join("")}
  ${adSlot("pico")}
  ${links}${ficha}${checkin}${nearHTML}`;
  return layout({
    title: `Previsão de surf em ${p.nome} (${p.cidade}, ${p.uf}): ondas, vento e maré · Tá Rolando?`,
    desc: `${p.nome} hoje: ${COND[d0.bw.mx][0]} (${say(d0.bw.mx)[0]}), ${fmt(d0.bw.at.H)} m e ${d0.bw.at.per}s. Top moment ${hhmm(tm.from)} às ${hhmm(tm.to)}. Ondas, vento, maré e tempo para 8 dias.`,
    path: picoPath(p), body, crumbs, jsonld: [place]
  });
}

export function textPage({ path, title, h1, html, desc }) {
  return layout({ title: `${title} · Tá Rolando?`, desc, path, body: `<article class="prose"><h1 class="page">${esc(h1)}</h1>${html}</article>`, crumbs: [["Início", "/"], [title, path]] });
}
