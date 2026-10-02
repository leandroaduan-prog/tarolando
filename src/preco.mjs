// Algoritmo de preço dos patrocínios (preço por vaga, por praia, por dia).
// Os valores padrão ficam aqui; para mudar, crie privado/precos.json só com o que quiser trocar.

export const PADRAO = {
  base: 10,
  minimo: 5,
  maximo: 60,
  vagasPorPraia: 5,
  audiencia: { A: 2.0, B: 1.4, C: 1.0, D: 0.7 },
  // praias famosas começam na faixa A até termos dados de visitas (privado/audiencia.json)
  famosas: ["maresias", "itacoatiara", "joaquina", "itauna", "praia-mole", "tombo", "itamambuca", "arpoador", "prainha", "silveira",
    "praia-da-vila", "campeche", "tiririca", "cacimba-do-padre", "baia-formosa", "o-pontal", "barra-da-tijuca-postinho-e-pier", "regencia", "felix", "ferrugem"],
  temporada: {
    sulSudeste: { 1: 1.3, 2: 1.3, 3: 0.9, 4: 0.9, 5: 1.0, 6: 1.0, 7: 1.2, 8: 1.0, 9: 1.0, 10: 0.9, 11: 0.9, 12: 1.3 },
    norteNordeste: { 1: 1.3, 2: 1.3, 3: 1.0, 4: 0.9, 5: 0.9, 6: 0.9, 7: 1.25, 8: 1.0, 9: 1.0, 10: 1.0, 11: 1.0, 12: 1.3 }
  },
  fimDeSemana: 1.2,
  feriado: 1.5,
  feriadoForte: 2.0, // Carnaval e Réveillon
  ocupacao: { livre: 1.0, tres: 1.15, ultima: 1.3 }, // 0–2 ocupadas, 3 ocupadas, 4 ocupadas (última vaga)
  pacote: { variasPraias: 0.10, cidade: 0.20, estado: 0.35, brasil: 0.50 },
  duracao: [[90, 0.30], [30, 0.20], [7, 0.10]]
};
const NORTE_NORDESTE = new Set(["AP", "PA", "MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA"]);

/* ---------- datas ---------- */
const D = s => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const S = d => d.toISOString().slice(0, 10);
export const addDias = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return S(d); };
function pascoa(ano) { // algoritmo de Meeus
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return S(new Date(Date.UTC(ano, mes - 1, dia)));
}
const cacheFeriados = {};
export function feriados(ano) {
  if (cacheFeriados[ano]) return cacheFeriados[ano];
  const p = pascoa(ano), f = new Map();
  for (const md of ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"]) f.set(`${ano}-${md}`, "feriado");
  f.set(addDias(p, -48), "forte"); f.set(addDias(p, -47), "forte"); // Carnaval
  f.set(addDias(p, -2), "feriado"); // Sexta-feira Santa
  f.set(addDias(p, 60), "feriado"); // Corpus Christi
  f.set(`${ano}-12-31`, "forte"); f.set(`${ano}-01-01`, "forte"); // Réveillon
  return (cacheFeriados[ano] = f);
}
/* feriado, ou fim de semana colado num feriado */
function tipoFeriado(s) {
  const fer = feriados(Number(s.slice(0, 4)));
  if (fer.has(s)) return fer.get(s);
  const dow = D(s).getUTCDay();
  if (dow === 6 || dow === 0) {
    for (const k of [-2, -1, 1, 2]) {
      const v = addDias(s, k), t = feriados(Number(v.slice(0, 4))).get(v);
      if (t && [1, 5].includes(D(v).getUTCDay())) return t; // feriado na sexta ou segunda: feriadão
    }
  }
  return null;
}

/* ---------- onde: "brasil", "estado:sp", "cidade:sp/guaruja", "sp/guaruja/tombo" ---------- */
export const chave = p => `${p.ufSlug}/${p.cidadeSlug}/${p.slug}`;
export function resolveOnde(onde, picos) {
  const out = new Set(), lista = Array.isArray(onde) ? onde : [onde];
  for (const o of lista) {
    const x = String(o).trim().toLowerCase();
    for (const p of picos) {
      if (p.poro) continue;
      if (x === "brasil" || (x.startsWith("estado:") && p.ufSlug === x.slice(7)) || (x.startsWith("cidade:") && `${p.ufSlug}/${p.cidadeSlug}` === x.slice(7)) || chave(p) === x) out.add(p);
    }
  }
  return [...out];
}
function tipoPacote(onde, n, cfg) {
  const lista = (Array.isArray(onde) ? onde : [onde]).map(o => String(o).toLowerCase());
  if (lista.includes("brasil")) return ["Brasil inteiro", cfg.pacote.brasil];
  if (lista.some(o => o.startsWith("estado:"))) return ["Estado inteiro", cfg.pacote.estado];
  if (lista.some(o => o.startsWith("cidade:"))) return ["Cidade inteira", cfg.pacote.cidade];
  if (n >= 2) return ["Várias praias", cfg.pacote.variasPraias];
  return ["Uma praia", 0];
}

/* ---------- ocupação ---------- */
export function ativosNoDia(patrocinios, p, dia, picos) {
  return patrocinios.filter(s => s.inicio <= dia && dia <= s.fim && resolveOnde(s.onde, picos).includes(p)).length;
}

/* ---------- preço de uma praia num dia ---------- */
export function precoDia(p, dia, { cfg = PADRAO, audiencia = {}, eventos = [], ocupadas = 0, picos = [] } = {}) {
  if (ocupadas >= cfg.vagasPorPraia) return null; // esgotado
  const faixa = audiencia[chave(p)] || (cfg.famosas.includes(p.slug) ? "A" : "C");
  const mes = Number(dia.slice(5, 7)), reg = NORTE_NORDESTE.has(p.uf) ? "norteNordeste" : "sulSudeste";
  let v = cfg.base * (cfg.audiencia[faixa] || 1) * cfg.temporada[reg][mes];
  const dow = D(dia).getUTCDay(), fer = tipoFeriado(dia);
  if (fer === "forte") v *= cfg.feriadoForte; else if (fer) v *= cfg.feriado; else if (dow === 0 || dow === 6) v *= cfg.fimDeSemana;
  const ev = eventos.filter(e => e.inicio <= dia && dia <= e.fim && resolveOnde(e.onde, picos).includes(p));
  if (ev.length) v *= Math.max(...ev.map(e => e.fator || 1.5));
  v *= ocupadas >= 4 ? cfg.ocupacao.ultima : ocupadas === 3 ? cfg.ocupacao.tres : cfg.ocupacao.livre;
  v = Math.min(cfg.maximo, Math.max(cfg.minimo, v));
  return Math.round(v * 2) / 2;
}

/* ---------- orçamento completo ---------- */
export function orcamento({ onde, inicio, dias, picos, patrocinios = [], eventos = [], audiencia = {}, cfg: extra = {} }) {
  const cfg = { ...PADRAO, ...extra };
  const praias = resolveOnde(onde, picos);
  let bruto = 0, esgotados = [];
  const linhas = praias.map(p => {
    let soma = 0, livre = true;
    for (let i = 0; i < dias; i++) {
      const dia = addDias(inicio, i);
      const v = precoDia(p, dia, { cfg, audiencia, eventos, picos, ocupadas: ativosNoDia(patrocinios, p, dia, picos) });
      if (v == null) { livre = false; break; }
      soma += v;
    }
    if (!livre) {
      let d = inicio; // procura a próxima data com vaga em todo o período
      for (let k = 0; k < 400; k++) {
        d = addDias(inicio, k + 1);
        let ok = true;
        for (let i = 0; i < dias && ok; i++) if (ativosNoDia(patrocinios, p, addDias(d, i), picos) >= cfg.vagasPorPraia) ok = false;
        if (ok) break;
      }
      esgotados.push({ praia: `${p.nome} (${p.cidade}/${p.uf})`, livreA: d });
      return null;
    }
    bruto += soma;
    return { praia: `${p.nome} (${p.cidade}/${p.uf})`, total: soma };
  }).filter(Boolean);
  const [pacote, dPac] = tipoPacote(onde, linhas.length, cfg);
  const dDur = (cfg.duracao.find(([n]) => dias >= n) || [0, 0])[1];
  const total = Math.round(bruto * (1 - dPac) * (1 - dDur) * 100) / 100;
  return { praias: linhas, esgotados, bruto, pacote, descontoPacote: dPac, descontoDuracao: dDur, total, inicio, fim: addDias(inicio, dias - 1), dias };
}
