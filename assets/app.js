/* Tá Rolando? — interações no navegador */
(function () {
  const B = (window.TR && window.TR.base) || "";
  const IDX = window.TR_INDEX || { ufs: [], picos: [] };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const DIRS = ["N","NNE","NE","ENE","L","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
  const c16 = d => DIRS[Math.round((((d % 360) + 360) % 360) / 22.5) % 16];
  const fmt = n => n.toFixed(1).replace(".", ",");
  const hh = h => h + "h";
  const COND = [["Flat", "s0"], ["Marolinha", "s1"], ["Dá pra brincar", "s2"], ["Tá bom", "s3"], ["Clássico", "s4"], ["Mexido", "bad"]];
  const SAY = s => (s === 0 ? ["Vai pescar"] : s === 5 ? ["Esquece", 1] : s === 1 ? ["Força a barra"] : s === 2 ? ["De boa"] : ["Altas"]);
  const pill = s => `<span class="pill" style="--sc:var(--${COND[s][1]})"><span class="meter" aria-hidden="true">${[1, 2, 3, 4].map(k => `<i class="${k <= (s === 5 ? 1 : s) ? "on" : ""}"></i>`).join("")}</span>${COND[s][0]}</span>`;
  function motivo(per, kind, spd, s) {
    const r = [];
    if (per && per < 8) r.push("período curto"); else if (per >= 11) r.push("ondulação de período longo");
    if (kind === "maral" && spd >= 8) r.push("vento maral"); else if (kind === "lateral" && spd >= 15) r.push("vento lateral forte");
    else if (kind === "terral") r.push("vento terral"); else if (kind === "sem vento") r.push("sem vento");
    if (!r.length) return "";
    const t = r.join(" e ");
    return `<div class="why${s === 5 ? " bad" : ""}">${s === 5 ? `Tem onda, mas com ${t}: mar mexido` : t.charAt(0).toUpperCase() + t.slice(1)}</div>`;
  }
  const sayH = s => { const [t, bad] = SAY(s); return `<span class="say${bad ? " bad" : ""}">${t}</span>`; };

  /* ---------- favoritos ---------- */
  let favs = store.get("tr-favs", []);
  const STAR = on => `<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  function paintFavs() {
    $$("[data-fav]").forEach(b => {
      const on = favs.includes(b.dataset.fav);
      b.setAttribute("aria-pressed", on);
      b.innerHTML = STAR(on);
    });
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-fav]");
    if (!b) return;
    e.preventDefault();
    const id = b.dataset.fav;
    favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
    store.set("tr-favs", favs);
    paintFavs();
    renderYour();
    cacheFavs();
  });

  /* ---------- seu pico (página inicial) ---------- */
  let HOJE = null, sumFav = store.get("tr-sumfav", null);
  async function loadHoje() {
    if (!HOJE) HOJE = await (await fetch(B + "/dados/hoje.json?v=" + (window.TR.v || ""))).json();
    return HOJE;
  }
  function kmTo(lat, lon, p) {
    const R = 6371, t = x => (x * Math.PI) / 180, dl = t(p[4] - lat), dn = t(p[5] - lon);
    const h = Math.sin(dl / 2) ** 2 + Math.cos(t(lat)) * Math.cos(t(p[4])) * Math.sin(dn / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  /* Localização aproximada pelo IP (sem pedir permissão), guardada por 1 dia */
  async function approxLocation() {
    const saved = store.get("tr-loc", null);
    if (saved && Date.now() - saved.t < 864e5) return saved;
    const tries = [
      async () => { const j = await (await fetch("https://get.geojs.io/v1/ip/geo.json")).json(); return { lat: +j.latitude, lon: +j.longitude, city: j.city || "" }; },
      async () => { const j = await (await fetch("https://ipapi.co/json/")).json(); return { lat: +j.latitude, lon: +j.longitude, city: j.city || "" }; }
    ];
    for (const f of tries) {
      try { const l = await f(); if (isFinite(l.lat) && isFinite(l.lon) && (l.lat || l.lon)) { l.t = Date.now(); l.src = "ip"; store.set("tr-loc", l); return l; } } catch (e) {}
    }
    return null;
  }
  const WDS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], WDL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const dDate = i => { const [y, m, d] = HOJE.datas[i].split("-").map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };
  const dShort = i => (i === 0 ? "Hoje" : WDS[dDate(i).getUTCDay()]);
  const dLong = i => (i === 0 ? "Hoje" : i === 1 ? "Amanhã" : WDL[dDate(i).getUTCDay()]);
  const ddmm = i => HOJE.datas[i].slice(8, 10) + "/" + HOJE.datas[i].slice(5, 7);
  function wxIcon(sky) {
    const sun = `<circle cx="16" cy="16" r="6" fill="#F2B233"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="16" y1="5" x2="16" y2="8" stroke="#F2B233" stroke-width="2" stroke-linecap="round" transform="rotate(${a} 16 16)"/>`).join("")}`;
    const cloud = (x, y, c) => `<path d="M${x} ${y}h14a5 5 0 0 0 0-10 7 7 0 0 0-13-1 5 5 0 0 0-1 11z" fill="${c}"/>`;
    const g = sky === "sol" ? sun : sky === "parcial" ? `<g transform="translate(-4 -4)">${sun}</g>${cloud(9, 26, "#C9D6DB")}` : sky === "nublado" ? cloud(6, 22, "#9FB2BA") + cloud(10, 27, "#C9D6DB") : cloud(7, 20, "#9FB2BA") + `<path d="M11 24l-2 5M17 24l-2 5M23 24l-2 5" stroke="#4F9FCF" stroke-width="2" stroke-linecap="round"/>`;
    return `<svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true" style="vertical-align:middle">${g}</svg>`;
  }
  const WA = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9c-1-.4-2-1.4-2.4-2.4l.9-1-1-2L9 8.5z" fill="currentColor"/></svg>';
  function spBox(list) {
    if (!list || !list.length) return "";
    return `<div class="spons" data-rot aria-label="Patrocinadores"><span class="sp-lab">Patrocínio</span>${list.map((x, k) => `<a class="sp-item" href="${esc(x[2] || "#")}"${x[2] ? ' target="_blank" rel="sponsored noopener"' : ""}${k ? " hidden" : ""}><img src="${B + x[1]}" alt="${esc(x[0])}"></a>`).join("")}</div>`;
  }
  function dayPanel(id, i, label) {
    const p = HOJE.picos[id], x = p.d[i];
    const [from, to, s, H, per, sd, wd, ws, kind, bf, bt, w, sky, tmax, rain, hi] = x;
    const mh = Math.max(1, ...p.d.map(y => y[3]));
    const ww = w ? `Vento a favor: <b>${hh(w[0])} às ${hh(w[1])}</b> · ${w[4] === "terral" ? "terral " + c16(w[2]) + " " + w[3] + " km/h" : w[4] === "sem vento" ? "sem vento" : "vento fraco"}` : "Sem horário de vento a favor";
    const quando = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : `${dLong(i)} (${ddmm(i)})`;
    const text = `${quando} em ${p.n}: ${COND[s][0]} (“${SAY(s)[0]}”), top moment ${hh(from)} às ${hh(to)}, ${fmt(H)} m. Bora?`;
    const url = location.origin + B + p.u + "#dia-" + i;
    return `<article class="panel sum">
      <div class="row" style="justify-content:space-between;position:relative"><p class="label">${label} · ${dLong(i)} ${ddmm(i)}</p><span class="soft" style="font-size:.85rem;display:inline-flex;align-items:center;gap:6px">${wxIcon(sky)} ${tmax}° · chuva ${rain}%</span></div>
      <div class="name"><a href="${B + p.u}#dia-${i}" style="color:inherit;text-decoration:none">${esc(p.n)}</a></div>
      <div class="line soft">${esc(p.c)} · ${p.uf}</div>
      <div class="topm${p.sp && p.sp.length ? " has-sp" : ""}">${spBox(p.sp)}<span class="tm-badge">Top moment ${i === 0 ? "de hoje" : i === 1 ? "de amanhã" : "do dia"}</span><div class="tm-time">${hh(from)} às ${hh(to)}</div>
        <div class="line">${pill(s)}${sayH(s)}</div>
        ${motivo(per, kind, ws, s)}
        <div class="line soft">${fmt(H)} m · ${per}s de ${c16(sd)} · ${kind === "sem vento" ? "sem vento" : "vento " + ws + " km/h " + c16(wd) + " (" + kind + ")"}</div>
        ${bt - bf > 3 || hi ? `<div class="soft" style="font-size:.85rem;position:relative">${bt - bf > 3 ? `Janela boa no dia: ${hh(bf)} às ${hh(bt)}` : ""}${bt - bf > 3 && hi ? " · " : ""}${hi ? "maré alta " + hi : ""}</div>` : ""}</div>
      <div class="windok">${ww}</div>
      <div class="week">${p.d.map((y, k) => `<button type="button" data-go="${k}" class="${k === i ? "best" : ""}" aria-label="${dLong(k)}"><span class="h">${fmt(y[3])}</span><span class="bar" style="--sc:var(--${COND[y[2]][1]});height:${(8 + 40 * (y[3] / mh)).toFixed(0)}px"></span><span class="d">${dShort(k)}</span></button>`).join("")}</div>
      <a class="btn share" data-share data-text="${esc(text)}" data-url="${esc(url)}" href="https://wa.me/?text=${encodeURIComponent(text + " " + url)}" target="_blank" rel="noopener">${WA}${i === 0 ? "Mandar pra galera no WhatsApp" : i === 1 ? "Mandar amanhã pra galera" : "Mandar esse dia pra galera"}</a>
    </article>`;
  }
  function setAppShare(id) {
    const b = $("#share-app"), p = HOJE && HOJE.picos[id];
    if (!b || !p || b.dataset.base) return;
    b.dataset.base = b.dataset.text;
    const s = p.d ? p.d[0][2] : p.wk[0][0];
    const text = b.dataset.text + ` Hoje em ${p.n}: ${COND[s][0]} (“${SAY(s)[0]}”), top moment ${hh(p.t[0])} às ${hh(p.t[1])}. Olha aí:`;
    b.dataset.text = text;
    b.href = "https://wa.me/?text=" + encodeURIComponent(text + " " + b.dataset.url);
  }
  function yourCarousel(el, id, label, before, after) {
    const p = HOJE.picos[id];
    if (!p || !p.d) return false;
    el.className = "your-wrap";
    el.innerHTML = `${before || ""}<div class="carousel" id="yourcar" data-dots="yourdots">${p.d.map((_, i) => dayPanel(id, i, label)).join("")}</div>
      <div class="dots" id="yourdots" aria-hidden="true">${p.d.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</div>
      <p class="muted" style="margin:0;font-size:.82rem;text-align:center">Arraste para o lado para ver os próximos dias</p>${after || ""}`;
    setupCar($("#yourcar"));
    setAppShare(id);
    const sh = $("#share-home"); if (sh) sh.hidden = true;
    return true;
  }

  /* Praias da cidade do seu pico (ou perto dele), da melhor para a pior */
  function cardHTML(id, km) {
    const p = HOJE.picos[id];
    const [H, per, sd, wd, ws, kind] = p.a, s = p.wk[0][0];
    const mh = Math.max(1, ...p.wk.map(w => w[1]));
    const dn = i => { if (i === 0) return "Hoje"; const [y, m, d] = HOJE.datas[i].split("-").map(Number); return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()]; };
    const FL = { S: "Isolado", B: "Ondas grandes", T: "Risco de tubarão" };
    return `<li class="card"><a class="card-main" href="${B + p.u}">
      <div class="card-top"><h3>${esc(p.n)}</h3><div class="city">${esc(p.c)} · ${p.uf}${km != null ? ` · ${Math.round(km)} km` : ""} · <span class="tag">${esc(p.lv)}</span> ${[...(p.fl || "")].filter(k => FL[k]).map(k => `<span class="tag flag-${k}">${FL[k]}</span>`).join(" ")}</div></div>
      <div class="row">${pill(s)}${sayH(s)}</div>
      ${motivo(per, kind, ws, s)}
      <div class="stats">
        <div class="stat"><span>Ondulação</span><b>${fmt(H)} m · ${per}s<br>${c16(sd)}</b></div>
        <div class="stat"><span>Vento</span><b>${kind === "sem vento" ? "Sem vento" : ws + " km/h " + c16(wd) + "<br>" + kind}</b></div>
        <div class="stat"><span>Maré alta</span><b>${p.hi || "–"}</b></div>
      </div>
      <div class="window">Hoje, melhor janela: <strong>${hh(p.bw[0])} às ${hh(p.bw[1])}</strong>.<br>${p.ww ? `Vento a favor: <strong>${hh(p.ww[0])} às ${hh(p.ww[1])}</strong>` : "Sem horário de vento a favor"}</div>
      <div class="mini8" aria-hidden="true">${p.wk.map(w => `<i style="--sc:var(--${COND[w[0]][1]});height:${(6 + 28 * (w[1] / mh)).toFixed(0)}px"></i>`).join("")}</div>
      <div class="mini8-l" aria-hidden="true">${p.wk.map((w, i) => `<span>${dn(i)}</span>`).join("")}</div>
    </a><button class="fav" type="button" aria-pressed="false" data-fav="${id}" aria-label="Favoritar ${esc(p.n)}"></button></li>`;
  }
  function renderLocal(refId) {
    const el = $("#local");
    if (!el || !HOJE.picos[refId]) return;
    const ref = HOJE.picos[refId], pos = new Map(IDX.picos.map(p => [p[0], p]));
    const rp = pos.get(refId);
    const rank = id => { const s = HOJE.picos[id].wk[0][0]; return s === 5 ? 0.5 : s; };
    let ids = Object.keys(HOJE.picos).filter(id => HOJE.picos[id].c === ref.c && HOJE.picos[id].uf === ref.uf);
    let title = `Hoje em ${esc(ref.c)}`;
    if (ids.length < 4 && rp) { // cidade com poucos picos: inclui os vizinhos até 40 km
      const extra = Object.keys(HOJE.picos).filter(id => !ids.includes(id) && pos.get(id) && kmTo(rp[4], rp[5], pos.get(id)) <= 30);
      if (extra.length) { ids = ids.concat(extra); title = `Hoje em ${esc(ref.c)} e região`; }
    }
    ids.sort((a, b) => rank(b) - rank(a) || HOJE.picos[b].a[0] - HOJE.picos[a].a[0]);
    ids = ids.slice(0, 12);
    el.innerHTML = `<h2 class="section-title">${title}</h2><p class="muted" style="margin:-4px 0 10px;font-size:.88rem">Da melhor para a pior condição de hoje.</p>
      <ul class="list">${ids.map(id => cardHTML(id, rp && pos.get(id) && id !== refId ? kmTo(rp[4], rp[5], pos.get(id)) : null)).join("")}</ul>`;
    el.hidden = false;
    paintFavs();
  }
  function setHomeShare(id) {
    const b = $("#share-home"), p = HOJE && HOJE.picos[id];
    if (!b || !p) return;
    const s = p.wk[0][0], text = `Tá rolando em ${p.n}? Hoje: ${COND[s][0]} (“${SAY(s)[0]}”), top moment ${hh(p.t[0])} às ${hh(p.t[1])}. Olha a previsão:`;
    const url = location.origin + B + p.u;
    b.dataset.text = text; b.dataset.url = url;
    b.href = "https://wa.me/?text=" + encodeURIComponent(text + " " + url);
  }
  async function renderYour() {
    const el = $("#your");
    if (!el) return;
    try { await loadHoje(); } catch (e) { return; }
    const list = favs.filter(id => HOJE.picos[id]);
    if (list.length) {
      const id = list.includes(sumFav) ? sumFav : list[0];
      yourCarousel(el, id, "Seu pico", list.length > 1 ? `<div class="scroller">${list.map(x => `<button class="chip" type="button" data-sumfav="${x}" aria-pressed="${x === id}">${esc(HOJE.picos[x].n)}</button>`).join("")}</div>` : "");
      renderLocal(id);
      return;
    }
    // Sem favorito: mostra o pico mais perto de onde a pessoa está
    const loc = await approxLocation();
    if (!loc || favs.length) return; // sem localização, fica o "melhor do Brasil"
    const near = IDX.picos.filter(p => HOJE.picos[p[0]]).map(p => [p, kmTo(loc.lat, loc.lon, p)]).sort((a, b) => a[1] - b[1])[0];
    if (!near) return;
    const [p, k] = near;
    yourCarousel(el, p[0], `Mais perto de você${loc.city ? " (" + esc(loc.city) + ")" : ""} · ${Math.round(k)} km`, "",
      `<button class="btn" type="button" data-fixfav="${p[0]}" style="justify-self:start">☆ Fixar ${esc(HOJE.picos[p[0]].n)} como meu pico</button>`);
    renderLocal(p[0]);
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-fixfav]");
    if (!b) return;
    favs = [...new Set([...favs, b.dataset.fixfav])];
    store.set("tr-favs", favs);
    paintFavs(); renderYour(); cacheFavs();
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-sumfav]");
    if (!b) return;
    sumFav = b.dataset.sumfav; store.set("tr-sumfav", sumFav); renderYour();
  });

  /* ---------- carrosséis de dias (arrastar para o lado) ---------- */
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const carIdx = c => Math.round(c.scrollLeft / (c.clientWidth + 10));
  function syncCar(c, i) {
    c.dataset.idx = i;
    const dots = c.dataset.dots && document.getElementById(c.dataset.dots);
    if (dots) [...dots.children].forEach((d, k) => (d.className = k === i ? "on" : ""));
    $$(`[data-car="${c.id}"]`).forEach(tabs => [...tabs.querySelectorAll("[data-go]")].forEach(t => {
      const on = +t.dataset.go === i;
      t.setAttribute("aria-pressed", on);
      if (on) t.scrollIntoView({ block: "nearest", inline: "nearest" });
    }));
    if (c.dataset.days) showDay(i);
  }
  function goCar(c, i, smooth = true) {
    c.scrollTo({ left: i * (c.clientWidth + 10), behavior: smooth && !reduce() ? "smooth" : "auto" });
    syncCar(c, i);
  }
  function setupCar(c) {
    if (!c || c.dataset.ready) return;
    c.dataset.ready = 1;
    let st;
    c.addEventListener("scroll", () => {
      clearTimeout(st);
      st = setTimeout(() => { const i = carIdx(c); if (i !== +(c.dataset.idx || 0)) syncCar(c, i); }, 90);
    });
  }
  $$(".carousel").forEach(setupCar);
  window.addEventListener("resize", () => $$(".carousel").forEach(c => (c.scrollLeft = (+(c.dataset.idx || 0)) * (c.clientWidth + 10))));

  /* detalhes do dia na página do pico (hora a hora, maré, água) */
  function showDay(i) {
    const secs = $$("section.day");
    if (!secs.length) return;
    secs.forEach((s, k) => (s.hidden = k !== i));
  }
  document.addEventListener("click", e => {
    const g = e.target.closest("[data-go]");
    if (!g) return;
    const n = +g.dataset.go;
    const tabs = g.closest("[data-car]"), c = tabs ? document.getElementById(tabs.dataset.car) : g.closest(".carousel");
    if (c) { e.preventDefault(); goCar(c, n); }
  });
  const daycar = $("#daycar"), m = location.hash.match(/^#dia-(\d)$/);
  if (daycar && m) { const i = +m[1]; requestAnimationFrame(() => { goCar(daycar, i, false); daycar.scrollIntoView({ block: "start" }); }); }

  /* ---------- passaporte ---------- */
  let visits = store.get("tr-visits", {});
  function paintCheckin() {
    $$("[data-checkin]").forEach(b => {
      const on = visits[b.dataset.checkin] === todayKey();
      b.disabled = on;
      b.textContent = on ? "Carimbado hoje no passaporte" : "Surfei aqui hoje";
    });
    const el = $("#pass");
    const ids = Object.keys(visits);
    if (!el || !ids.length) return;
    const names = new Map(IDX.picos.map(p => [p[0], p]));
    el.hidden = false;
    el.innerHTML = `<div><p class="label">Passaporte do surfista</p><h2>${ids.length} ${ids.length > 1 ? "picos carimbados" : "pico carimbado"}</h2></div>
      <p>De ${IDX.picos.length} picos no Brasil. Abra um pico e toque em "Surfei aqui hoje" para carimbar.</p>
      <div class="stamps">${ids.filter(id => names.get(id)).map(id => { const p = names.get(id), v = visits[id]; return `<a class="stamp on" href="${B + p[6]}" style="text-decoration:none">${esc(p[1])}<br>${v.slice(8, 10)}/${v.slice(5, 7)}</a>`; }).join("")}</div>`;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-checkin]");
    if (!b) return;
    visits[b.dataset.checkin] = todayKey();
    store.set("tr-visits", visits);
    paintCheckin();
  });

  /* ---------- escolher praia ---------- */
  const sheet = $("#sheet"), sin = $("#sheet-in");
  const openSheet = html => { sin.innerHTML = html; sheet.hidden = false; document.body.style.overflow = "hidden"; sin.scrollTop = 0; const c = $(".close", sin); if (c) c.focus(); };
  const closeSheet = () => { sheet.hidden = true; document.body.style.overflow = ""; };
  sheet.addEventListener("click", e => { if (e.target === sheet || e.target.closest(".close")) closeSheet(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });
  const head = (t, sub, back) => `<div class="sheet-head"><div class="row" style="align-items:flex-start">${back ? `<button class="back" type="button" aria-label="Voltar para estados">‹</button>` : ""}<div><h2 id="sheet-title">${t}</h2><div class="muted">${sub}</div></div></div><button class="close" type="button" aria-label="Fechar">×</button></div>`;
  function pickState() {
    openSheet(`${head("Onde você quer surfar?", "Escolha o estado e depois a cidade")}
      <button class="near" id="near" type="button"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="currentColor"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Praias perto de mim</span></button>
      <p class="msg" id="near-msg" hidden></p><div class="near-list" id="near-list"></div>
      <p class="label" style="margin-top:16px">Estados, de norte a sul</p>
      <div class="ufgrid">${IDX.ufs.map(u => `<button class="uf" type="button" data-uf="${u.uf}"><b>${u.uf}</b><span>${esc(u.nome)}</span><small>${u.n} picos</small></button>`).join("")}</div>`);
  }
  function pickCity(uf) {
    const u = IDX.ufs.find(x => x.uf === uf);
    openSheet(`${head(esc(u.nome), "Escolha a cidade ou veja tudo", true)}
      <div class="cities"><a class="city-btn all" href="${B + u.url}"><span>Todas as praias de ${uf}</span><small>${u.n} picos</small></a>
      ${u.cities.map(c => `<a class="city-btn" href="${B + c[1]}"><span>${esc(c[0])}</span><small>${c[2]} ${c[2] > 1 ? "picos" : "pico"}</small></a>`).join("")}</div>`);
  }
  function showNear(lat, lon, label) {
    const R = 6371, t = x => (x * Math.PI) / 180;
    const d = p => { const dl = t(p[4] - lat), dn = t(p[5] - lon); const h = Math.sin(dl / 2) ** 2 + Math.cos(t(lat)) * Math.cos(t(p[4])) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
    const list = IDX.picos.map(p => [p, d(p)]).sort((a, b) => a[1] - b[1]).slice(0, 12);
    $("#near-msg").hidden = false;
    $("#near-msg").textContent = `Mais perto de ${label}:`;
    $("#near-list").innerHTML = list.map(([p, k]) => `<a class="city-btn" href="${B + p[6]}"><span>${esc(p[1])} <small>· ${esc(p[2])}, ${p[3]}</small></span><small>${Math.round(k)} km</small></a>`).join("");
  }
  async function nearMe() {
    const btn = $("#near"), lbl = $("span", btn);
    btn.disabled = true; lbl.textContent = "Procurando você…";
    const viaIP = async () => {
      try {
        const r = await fetch("https://ipapi.co/json/"); const j = await r.json();
        if (typeof j.latitude !== "number") throw 0;
        showNear(j.latitude, j.longitude, j.city || "você");
      } catch (e) {
        $("#near-msg").hidden = false;
        $("#near-msg").textContent = "Não deu para achar sua localização. Escolha o estado abaixo.";
      }
      btn.disabled = false; lbl.textContent = "Praias perto de mim";
    };
    if (!navigator.geolocation) return viaIP();
    navigator.geolocation.getCurrentPosition(
      pos => { store.set("tr-loc", { lat: pos.coords.latitude, lon: pos.coords.longitude, city: "", t: Date.now(), src: "gps" }); showNear(pos.coords.latitude, pos.coords.longitude, "você"); btn.disabled = false; lbl.textContent = "Praias perto de mim"; },
      () => viaIP(), { timeout: 8000, maximumAge: 600000 }
    );
  }
  $("#place").addEventListener("click", pickState);
  sin.addEventListener("click", e => {
    const u = e.target.closest("[data-uf]"); if (u) return pickCity(u.dataset.uf);
    if (e.target.closest(".back")) return pickState();
    if (e.target.closest("#near")) return nearMe();
  });


  /* ---------- app instalável (PWA) ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register(B + "/sw.js", { scope: B + "/" }).catch(() => {}));
  }
  // guarda as páginas dos picos favoritos para abrir sem internet
  function cacheFavs() {
    if (!("serviceWorker" in navigator) || !navigator.onLine) return;
    const urls = new Map(IDX.picos.map(p => [p[0], p[6]]));
    favs.forEach(id => { const u = urls.get(id); if (u) fetch(B + u, { credentials: "same-origin" }).catch(() => {}); });
  }
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const box = $("#install");
  let deferred = null;
  const dismissed = () => { const t = store.get("tr-install-no", 0); return Date.now() - t < 14 * 864e5; };
  const tag = $("#install-tag");
  const installed = () => standalone || store.get("tr-installed", false);
  function showInstall() {
    if (installed() || dismissed()) return;
    if (box) box.hidden = false;
    if (tag) tag.hidden = false;
  }
  function hideInstall() { if (box) box.hidden = true; if (tag) tag.hidden = true; }
  if (standalone) store.set("tr-installed", true);
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; showInstall(); });
  window.addEventListener("appinstalled", () => { store.set("tr-installed", true); hideInstall(); });
  if (tag) tag.addEventListener("click", e => {
    if (!box) return;
    e.preventDefault();
    box.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    box.classList.add("flash"); setTimeout(() => box.classList.remove("flash"), 1600);
  });
  if (ios && !standalone) showInstall();
  if (box) {
    $("#install-no").addEventListener("click", () => { store.set("tr-install-no", Date.now()); hideInstall(); });
    $("#install-go").addEventListener("click", async () => {
      if (deferred) {
        deferred.prompt();
        try { await deferred.userChoice; } catch (e) {}
        deferred = null;
      } else {
        openSheet(`${head("Instalar no iPhone", "Leva menos de 10 segundos")}
          <ol class="ios-steps">
            <li>No Safari, toque no botão <b>Compartilhar</b> (o quadrado com a seta para cima), na barra de baixo.</li>
            <li>Role a lista e toque em <b>Adicionar à Tela de Início</b>.</li>
            <li>Toque em <b>Adicionar</b>. O ícone do Tá Rolando aparece junto com seus apps.</li>
          </ol>
          <p class="msg">Se você abriu pelo Chrome ou outro navegador no iPhone, abra o site no Safari primeiro.</p>`);
      }
    });
  }
  /* ---------- compartilhar (abre o menu do celular; senão, WhatsApp) ---------- */
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-share]");
    if (!a || !navigator.share) return;
    e.preventDefault();
    navigator.share({ title: document.title, text: a.dataset.text, url: a.dataset.url }).catch(() => {});
  });
  /* ---------- rodízio dos patrocinadores (3 s cada, ordem sorteada por visita) ---------- */
  const SP_MS = 3000, spStart = Math.floor(Math.random() * 1000);
  let spTick = 0;
  function rotate() {
    if (document.hidden) return;
    spTick++;
    $$(".spons[data-rot]").forEach(box => {
      const items = box.querySelectorAll(".sp-item");
      if (items.length < 2) return;
      const k = (spStart + spTick) % items.length;
      items.forEach((a, j) => (a.hidden = j !== k));
    });
  }
  $$(".spons[data-rot]").forEach(box => { const items = box.querySelectorAll(".sp-item"); if (items.length > 1) items.forEach((a, j) => (a.hidden = j !== spStart % items.length)); });
  setInterval(rotate, SP_MS);
  paintFavs();
  paintCheckin();
  renderYour();
  cacheFavs();
})();
