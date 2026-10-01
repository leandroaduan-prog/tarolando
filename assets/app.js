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
  function panelHTML(id, top) {
    const p = HOJE.picos[id];
    const [from, to, s, H, per, sd, wd, ws, kind] = p.t;
    const mh = Math.max(1, ...p.wk.map(w => w[1]));
    let bi = 0; p.wk.forEach((w, i) => { const c = p.wk[bi]; const r = x => (x === 5 ? 0.5 : x); if (r(w[0]) > r(c[0]) || (r(w[0]) === r(c[0]) && w[1] > c[1])) bi = i; });
    const dn = i => { if (i === 0) return "Hoje"; const [y, m, d] = HOJE.datas[i].split("-").map(Number); return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()]; };
    const ww = p.ww ? `Vento a favor: <b>${hh(p.ww[0])} às ${hh(p.ww[1])}</b> · ${p.ww[4] === "terral" ? "terral " + c16(p.ww[2]) + " " + p.ww[3] + " km/h" : p.ww[4] === "sem vento" ? "sem vento" : "vento fraco"}` : "Sem horário de vento a favor";
    const old = HOJE.gerado && todayKey() !== HOJE.datas[0];
    return `${top}
      <div class="name"><a href="${B + p.u}" style="color:inherit;text-decoration:none">${esc(p.n)}</a></div>
      <div class="line soft">${esc(p.c)} · ${p.uf}</div>
      <div class="topm"><span class="tm-badge">Top moment de hoje</span><div class="tm-time">${hh(from)} às ${hh(to)}</div>
        <div class="line">${pill(s)}${sayH(s)}</div>
        <div class="line soft">${fmt(H)} m · ${per}s de ${c16(sd)} · ${kind === "sem vento" ? "sem vento" : "vento " + ws + " km/h " + c16(wd) + " (" + kind + ")"}</div>
        ${p.bw[1] - p.bw[0] > 3 ? `<div class="soft" style="font-size:.85rem;position:relative">Janela boa no dia: ${hh(p.bw[0])} às ${hh(p.bw[1])}</div>` : ""}</div>
      <div class="windok">${ww}</div>
      <div class="week">${p.wk.map((w, i) => `<a href="${B + p.u}#dia-${i}" class="${i === bi ? "best" : ""}" style="display:grid;gap:3px;justify-items:center;color:inherit;text-decoration:none;padding:4px 0"><span class="h">${fmt(w[1])}</span><span class="bar" style="--sc:var(--${COND[w[0]][1]});height:${(8 + 46 * (w[1] / mh)).toFixed(0)}px"></span><span class="d">${dn(i)}</span></a>`).join("")}</div>
      ${old ? `<p class="soft" style="margin:0;position:relative;font-size:.8rem">Previsão de ${HOJE.datas[0].split("-").reverse().join("/")}. Atualize a página.</p>` : ""}`;
  }
  async function renderYour() {
    const el = $("#your");
    if (!el) return;
    try { await loadHoje(); } catch (e) { return; }
    const list = favs.filter(id => HOJE.picos[id]);
    if (list.length) {
      const id = list.includes(sumFav) ? sumFav : list[0];
      el.innerHTML = panelHTML(id, `<p class="label">Seu pico</p>
        ${list.length > 1 ? `<div class="favsw">${list.map(x => `<button type="button" data-sumfav="${x}" aria-pressed="${x === id}">${esc(HOJE.picos[x].n)}</button>`).join("")}</div>` : ""}`);
      return;
    }
    // Sem favorito: mostra o pico mais perto de onde a pessoa está
    const loc = await approxLocation();
    if (!loc || favs.length) return; // sem localização, fica o "melhor do Brasil"
    const near = IDX.picos.filter(p => HOJE.picos[p[0]]).map(p => [p, kmTo(loc.lat, loc.lon, p)]).sort((a, b) => a[1] - b[1])[0];
    if (!near) return;
    const [p, k] = near;
    el.innerHTML = panelHTML(p[0], `<p class="label">Pico mais perto de você${loc.city ? " · " + esc(loc.city) : ""} · ${Math.round(k)} km</p>`) +
      `<button class="go" type="button" data-fixfav="${p[0]}" style="position:relative">☆ Fixar como meu pico</button>`;
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

  /* ---------- carrossel de dias ---------- */
  const car = $("#carousel");
  let panel = 0;
  function syncPanel() {
    $$("#tabs .chip").forEach((c, i) => c.setAttribute("aria-pressed", i === panel));
    $$("#dots i").forEach((d, i) => (d.className = i === panel ? "on" : ""));
    const t = $$("#tabs .chip")[panel];
    if (t) t.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  function goPanel(i) {
    panel = i;
    car.scrollTo({ left: i * (car.clientWidth + 10), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    syncPanel();
  }
  if (car) {
    let st;
    car.addEventListener("scroll", () => {
      clearTimeout(st);
      st = setTimeout(() => { const i = Math.round(car.scrollLeft / (car.clientWidth + 10)); if (i !== panel) { panel = i; syncPanel(); } }, 90);
    });
    window.addEventListener("resize", () => (car.scrollLeft = panel * (car.clientWidth + 10)));
  }

  /* ---------- dias na página do pico ---------- */
  function showDay(i, scroll) {
    const secs = $$("section.day");
    if (!secs.length) return;
    secs.forEach((s, k) => (s.hidden = k !== i));
    $$("#daytabs .chip").forEach((c, k) => c.setAttribute("aria-pressed", k === i));
    if (scroll) $("#daytabs").scrollIntoView({ block: "start", behavior: "smooth" });
  }
  document.addEventListener("click", e => {
    const g = e.target.closest("[data-go]");
    if (g) {
      const n = +g.dataset.go;
      if (car && (g.closest("#tabs") || g.closest("#carousel"))) goPanel(n);
      else if ($("#daytabs")) showDay(Math.max(0, n - 1), true);
      return;
    }
    const d = e.target.closest("#daytabs [data-day]");
    if (d) showDay(+d.dataset.day, false);
  });
  const m = location.hash.match(/^#dia-(\d)$/);
  if (m) showDay(+m[1], true);

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
  function showInstall() { if (box && !standalone && !dismissed()) box.hidden = false; }
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; showInstall(); });
  window.addEventListener("appinstalled", () => { if (box) box.hidden = true; });
  if (ios && !standalone) showInstall();
  if (box) {
    $("#install-no").addEventListener("click", () => { store.set("tr-install-no", Date.now()); box.hidden = true; });
    $("#install-go").addEventListener("click", async () => {
      if (deferred) {
        deferred.prompt();
        try { await deferred.userChoice; } catch (e) {}
        deferred = null; box.hidden = true;
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
  paintFavs();
  paintCheckin();
  renderYour();
  cacheFavs();
})();
