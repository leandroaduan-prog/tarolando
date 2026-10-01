// Busca a previsão na Open-Meteo e transforma em dados de cada pico.
import { HOURS, exposure, windKind, score, bestWindow, windWindow, topMoment } from "./rating.mjs";

const MARINE_VARS = [
  "wave_height", "wave_direction", "wave_period",
  "swell_wave_height", "swell_wave_direction", "swell_wave_period",
  "secondary_swell_wave_height", "secondary_swell_wave_direction", "secondary_swell_wave_period",
  "wind_wave_height", "wind_wave_direction", "wind_wave_period",
  "sea_level_height_msl", "sea_surface_temperature"
];
const WX_HOURLY = ["temperature_2m", "precipitation_probability", "weather_code", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"];
const WX_DAILY = ["temperature_2m_max", "temperature_2m_min", "precipitation_probability_max", "weather_code"];
const DAYS = 8, BATCH = 40;

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Ponto no mar, alguns km à frente da praia, para o modelo de ondas */
export function seaPoint(p, km) {
  const t = (p.face * Math.PI) / 180;
  return { lat: p.lat + (km / 111) * Math.cos(t), lon: p.lon + (km / (111 * Math.cos((p.lat * Math.PI) / 180))) * Math.sin(t) };
}

async function getJSON(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url);
      if (r.status === 429) throw new Error("limite de chamadas (429)");
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
      return await r.json();
    } catch (e) {
      if (i === tries) throw e;
      console.warn(`  tentativa ${i} falhou (${e.message}); tentando de novo...`);
      await sleep(5000 * i);
    }
  }
}

function hosts(apiKey) {
  return apiKey
    ? { marine: "https://customer-marine-api.open-meteo.com/v1/marine", wx: "https://customer-api.open-meteo.com/v1/forecast", key: `&apikey=${apiKey}` }
    : { marine: "https://marine-api.open-meteo.com/v1/marine", wx: "https://api.open-meteo.com/v1/forecast", key: "" };
}

async function batched(points, build, label) {
  const out = [];
  for (let i = 0; i < points.length; i += BATCH) {
    const chunk = points.slice(i, i + BATCH);
    const lat = chunk.map(c => c.lat.toFixed(4)).join(","), lon = chunk.map(c => c.lon.toFixed(4)).join(",");
    console.log(`  ${label}: ${i + 1}–${i + chunk.length} de ${points.length}`);
    const j = await getJSON(build(lat, lon));
    out.push(...(Array.isArray(j) ? j : [j]));
    await sleep(8000); // respeita o limite por minuto do plano grátis
  }
  return out;
}

const hasMarine = m => m && m.hourly && m.hourly.wave_height && m.hourly.wave_height.some(v => v != null);

export async function fetchAll(picos, apiKey) {
  const H = hosts(apiKey);
  const mUrl = (lat, lon) => `${H.marine}?latitude=${lat}&longitude=${lon}&hourly=${MARINE_VARS.join(",")}&forecast_days=${DAYS}&timezone=America%2FSao_Paulo${H.key}`;
  const wUrl = (lat, lon) => `${H.wx}?latitude=${lat}&longitude=${lon}&hourly=${WX_HOURLY.join(",")}&daily=${WX_DAILY.join(",")}&forecast_days=${DAYS}&timezone=America%2FSao_Paulo&wind_speed_unit=kmh${H.key}`;

  const sea = picos.filter(p => !p.poro);
  const marine = await batched(sea.map(p => seaPoint(p, 4)), mUrl, "ondas");
  // Onde o modelo não tem dado (muito perto da costa), tenta um ponto mais para fora
  const miss = sea.map((p, i) => (hasMarine(marine[i]) ? -1 : i)).filter(i => i >= 0);
  if (miss.length) {
    console.log(`  ${miss.length} picos sem dado de onda perto da costa; buscando mais ao largo`);
    const again = await batched(miss.map(i => seaPoint(sea[i], 14)), mUrl, "ondas (ao largo)");
    miss.forEach((i, k) => { if (hasMarine(again[k])) marine[i] = again[k]; });
  }
  const weather = await batched(picos.map(p => ({ lat: p.lat, lon: p.lon })), wUrl, "tempo e vento");
  const M = new Map(sea.map((p, i) => [p.id, hasMarine(marine[i]) ? marine[i] : null]));
  return picos.map((p, i) => ({ p, marine: M.get(p.id) || null, weather: weather[i] }));
}

/* ---------- dados de exemplo (para testar sem internet) ---------- */
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function mockAll(picos, dates) {
  const times = dates.flatMap(d => Array.from({ length: 24 }, (_, h) => `${d}T${String(h).padStart(2, "0")}:00`));
  return picos.map(p => {
    const r = rng(hash(p.uf + dates[0]));
    const days = dates.map(() => ({ swH: 0.5 + r() * 1.5, swD: 80 + r() * 120, per: Math.round(7 + r() * 7), am: (300 + r() * 90) % 360, pm: 90 + r() * 70, pms: 10 + r() * 18, rain: r() }));
    const hourly = { time: times };
    MARINE_VARS.forEach(v => (hourly[v] = []));
    const wh = { time: times, temperature_2m: [], precipitation_probability: [], weather_code: [], wind_speed_10m: [], wind_direction_10m: [], wind_gusts_10m: [] };
    times.forEach((t, k) => {
      const d = days[Math.floor(k / 24)], h = k % 24, f = Math.min(1, Math.max(0, (h - 10) / 3)), hrs = k;
      hourly.swell_wave_height.push(d.swH); hourly.swell_wave_direction.push(d.swD); hourly.swell_wave_period.push(d.per);
      hourly.secondary_swell_wave_height.push(0.3); hourly.secondary_swell_wave_direction.push(90); hourly.secondary_swell_wave_period.push(7);
      hourly.wind_wave_height.push(0.2); hourly.wind_wave_direction.push(d.pm); hourly.wind_wave_period.push(4);
      hourly.wave_height.push(d.swH * 1.1); hourly.wave_direction.push(d.swD); hourly.wave_period.push(d.per);
      hourly.sea_level_height_msl.push(0.45 * Math.cos((2 * Math.PI * (hrs - 3)) / 12.42) + 0.12 * Math.cos((2 * Math.PI * (hrs - 5)) / 12));
      hourly.sea_surface_temperature.push(20 + (p.lat > -15 ? 6 : p.lat > -24 ? 2 : -1));
      wh.temperature_2m.push(22 + 6 * Math.sin(((h - 8) * Math.PI) / 14)); wh.precipitation_probability.push(Math.round(d.rain * 80));
      wh.weather_code.push(d.rain > 0.6 ? 61 : d.rain > 0.4 ? 3 : d.rain > 0.2 ? 2 : 0);
      wh.wind_direction_10m.push(f < 1 ? d.am : d.pm); wh.wind_speed_10m.push(4 + f * (d.pms - 4)); wh.wind_gusts_10m.push(8 + f * d.pms);
    });
    const daily = { time: dates, temperature_2m_max: days.map(() => 28), temperature_2m_min: days.map(() => 20), precipitation_probability_max: days.map(d => Math.round(d.rain * 90)), weather_code: days.map(d => (d.rain > 0.6 ? 61 : d.rain > 0.4 ? 3 : d.rain > 0.2 ? 2 : 0)) };
    return { p, marine: p.poro ? null : { hourly }, weather: { hourly: wh, daily } };
  });
}

/* ---------- processamento ---------- */
export function sky(code) {
  if (code == null) return "parcial";
  if (code <= 1) return "sol";
  if (code === 2) return "parcial";
  if (code === 3 || code === 45 || code === 48) return "nublado";
  if (code >= 95) return "tempestade";
  return "chuva";
}

function tideFor(levels) {
  // levels: 25 valores (0h..24h)
  const pts = levels.map((v, h) => ({ h, v })).filter(x => x.v != null);
  const ext = [];
  for (let i = 1; i < levels.length - 1; i++) {
    const a = levels[i - 1], b = levels[i], c = levels[i + 1];
    if (a == null || b == null || c == null) continue;
    const den = a - 2 * b + c;
    const off = den ? (0.5 * (a - c)) / den : 0, v = b - 0.25 * (a - c) * off;
    if (b > a && b >= c) ext.push({ h: i + off, v, t: "Alta" });
    if (b < a && b <= c) ext.push({ h: i + off, v, t: "Baixa" });
  }
  return { pts, ext };
}

export function process(raw) {
  const { p, marine, weather } = raw;
  const wt = weather.hourly.time;
  const dates = weather.daily.time.slice(0, DAYS);
  const idx = new Map(wt.map((t, i) => [t, i]));
  const mIdx = marine ? new Map(marine.hourly.time.map((t, i) => [t, i])) : null;
  const m = marine && marine.hourly;
  const g = (arr, i) => (arr && i != null ? arr[i] : null);

  const days = dates.map((date, di) => {
    const wx = {
      sky: sky(weather.daily.weather_code[di]),
      tmax: weather.daily.temperature_2m_max[di],
      tmin: weather.daily.temperature_2m_min[di],
      rain: weather.daily.precipitation_probability_max[di]
    };
    const day = { date, wx };
    if (p.poro || !m) return day;
    const hours = HOURS.map(h => {
      const key = `${date}T${String(h).padStart(2, "0")}:00`, wi = idx.get(key), mi = mIdx.get(key);
      const comps = [
        [g(m.swell_wave_height, mi), g(m.swell_wave_period, mi), g(m.swell_wave_direction, mi)],
        [g(m.secondary_swell_wave_height, mi), g(m.secondary_swell_wave_period, mi), g(m.secondary_swell_wave_direction, mi)],
        [g(m.wind_wave_height, mi), g(m.wind_wave_period, mi), g(m.wind_wave_direction, mi)]
      ].filter(c => c[0] != null && c[2] != null);
      if (!comps.length && g(m.wave_height, mi) != null) comps.push([m.wave_height[mi], m.wave_period[mi], m.wave_direction[mi]]);
      let best = null;
      for (const [H, per, dir] of comps) {
        const eff = H * exposure(p.face, dir) * p.fator;
        if (!best || eff > best.H) best = { H: eff, per: per || 0, swDir: dir };
      }
      if (!best) best = { H: 0, per: 0, swDir: 0 };
      const dir = g(weather.hourly.wind_direction_10m, wi) ?? 0, spd = g(weather.hourly.wind_speed_10m, wi) ?? 0;
      const kind = windKind(p.face, dir, spd);
      const x = { h, H: best.H, per: Math.round(best.per), swDir: best.swDir, dir, spd, gust: g(weather.hourly.wind_gusts_10m, wi), kind };
      x.s = score(x.H, x.per, kind, spd);
      return x;
    });
    const bw = bestWindow(hours);
    day.hours = hours;
    day.bw = bw;
    day.ww = windWindow(hours);
    day.top = topMoment(hours, bw);
    const levels = Array.from({ length: 25 }, (_, h) => {
      const d2 = h === 24 ? dates[di + 1] : date, hh = h === 24 ? 0 : h;
      return d2 ? g(m.sea_level_height_msl, mIdx.get(`${d2}T${String(hh).padStart(2, "0")}:00`)) : null;
    });
    day.tide = tideFor(levels);
    day.water = g(m.sea_surface_temperature, mIdx.get(`${date}T12:00`));
    return day;
  });
  return { ...p, days, noWaves: !p.poro && !m };
}
