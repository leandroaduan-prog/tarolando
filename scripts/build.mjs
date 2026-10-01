// Gera o site em dist/.  Uso: node scripts/build.mjs        (previsão real)
//                              node scripts/build.mjs --mock (dados de exemplo, sem internet)
import { mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PICOS, UFN } from "../src/picos.mjs";
import { fetchAll, mockAll, process as proc } from "../src/forecast.mjs";
import { setContext, homePage, statePage, cityPage, picoPage, textPage, picoPath, cityPath, ufPath, bestOf, esc } from "../src/render.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const config = JSON.parse(readFileSync(join(ROOT, "config.json"), "utf8"));
const MOCK = process.argv.includes("--mock");
const base = (process.env.BASE_PATH ?? config.basePath ?? "").replace(/\/$/, "");
const siteUrl = (process.env.SITE_URL || config.siteUrl).replace(/\/$/, "");

function km(a, b) {
  const R = 6371, t = x => (x * Math.PI) / 180, dl = t(b.lat - a.lat), dn = t(b.lon - a.lon);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function out(path, html) {
  const file = join(DIST, path.endsWith("/") ? path + "index.html" : path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const now = new Date();
const spDate = d => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
console.log(MOCK ? "Gerando com DADOS DE EXEMPLO" : "Buscando previsão na Open-Meteo...");
let raw;
if (MOCK) {
  const dates = Array.from({ length: 8 }, (_, i) => spDate(new Date(now.getTime() + i * 864e5)));
  raw = mockAll(PICOS, dates);
} else {
  raw = await fetchAll(PICOS, process.env.OPEN_METEO_API_KEY || "");
}
const all = raw.map(proc);
const dates = all[0].days.map(d => d.date);
const version = now.getTime().toString(36);
const updatedTxt = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(now) + (MOCK ? " (dados de exemplo)" : "");
setContext({ base, siteUrl, config, dates, version, updatedTxt });

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
const urls = [];
const page = (path, html) => { out(path, html); urls.push(path); };

page("/", homePage(all));
for (const uf of Object.keys(UFN)) {
  const list = all.filter(p => p.uf === uf);
  if (!list.length) continue;
  page(ufPath(uf), statePage(uf, list));
  const cities = [...new Set(list.map(p => p.cidade))];
  for (const c of cities) page(cityPath(list.find(p => p.cidade === c)), cityPage(list.filter(p => p.cidade === c)));
}
for (const p of all) {
  const near = all.filter(x => x !== p).map(x => ({ p: x, km: km(p, x) })).filter(x => x.km < 80).sort((a, b) => a.km - b.km).slice(0, 6);
  page(picoPath(p), picoPage(p, near));
}

/* páginas institucionais (exigidas pelo AdSense) */
const email = config.contactEmail;
page("/sobre/", textPage({ path: "/sobre/", title: "Sobre", h1: "Sobre o Tá Rolando?", desc: "O que é o Tá Rolando? e como a previsão de surf é calculada.", html: `
<p>O Tá Rolando? é uma previsão de surf feita para ser lida em segundos. Para cada pico do litoral brasileiro, juntamos a previsão de ondas, vento, maré e tempo e transformamos tudo numa nota simples, com o melhor horário para cair.</p>
<h2>Como a nota é calculada</h2>
<p>Usamos a altura e o período das ondulações em mar aberto e ajustamos pela direção para onde cada praia está virada. Depois olhamos o vento: terral (da terra para o mar) melhora a onda, maral (do mar para a terra) piora. O resultado vira uma escala de Flat a Clássico, com um comentário: Vai pescar, Força a barra, De boa, Altas ou Esquece.</p>
<h2>De onde vêm os dados</h2>
<p>Ondas, vento, tempo e maré vêm da <a href="https://open-meteo.com/">Open-Meteo</a>, que reúne modelos de serviços meteorológicos nacionais. A previsão é atualizada a cada 3 horas. A maré vem de modelo numérico, tem precisão limitada perto da costa e não serve para navegação.</p>
<h2>Picos</h2>
<p>A lista de picos e as coordenadas são aproximadas e estão sempre sendo revisadas. Se você conhece um pico e quer ajudar a completar a ficha dele, fale com a gente.</p>` }));
page("/contato/", textPage({ path: "/contato/", title: "Contato", h1: "Contato", desc: "Fale com o Tá Rolando?.", html: `
<p>Quer sugerir um pico, corrigir uma informação ou anunciar sua loja, escola ou shaper? Escreva para:</p>
<p><strong style="user-select:all">${esc(email)}</strong></p>` }));
page("/politica-de-privacidade/", textPage({ path: "/politica-de-privacidade/", title: "Política de privacidade", h1: "Política de privacidade", desc: "Como o Tá Rolando? trata seus dados.", html: `
<p>Última atualização: ${updatedTxt.split(",")[0].replace(" (dados de exemplo)", "")}.</p>
<p>Esta política explica como o Tá Rolando? (${esc(siteUrl.replace(/^https?:\/\//, ""))}) trata informações dos visitantes, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
<h2>O que guardamos no seu aparelho</h2>
<p>Seus picos favoritos, o passaporte do surfista e a última região escolhida ficam salvos só no seu navegador (armazenamento local). Esses dados não são enviados para nós.</p>
<h2>Localização</h2>
<p>Se você tocar em "Praias perto de mim", o navegador pede permissão para usar sua localização. Ela é usada só no seu aparelho para ordenar os picos por distância e não é guardada nem enviada para nós.</p>
<h2>Publicidade e cookies de terceiros</h2>
<p>Este site pode exibir anúncios do Google AdSense. O Google e seus parceiros usam cookies para mostrar anúncios com base em visitas anteriores a este e a outros sites. Você pode desativar a publicidade personalizada em <a href="https://adssettings.google.com/">Configurações de anúncios do Google</a> e saber mais em <a href="https://policies.google.com/technologies/ads?hl=pt-BR">Como o Google usa cookies em publicidade</a>.</p>
<h2>Serviços de terceiros</h2>
<p>Usamos fontes do Google Fonts. Ao abrir o site, seu navegador se conecta aos servidores do Google para baixar essas fontes.</p>
<h2>Seus direitos e contato</h2>
<p>Para dúvidas ou pedidos sobre seus dados, escreva para ${esc(email)}.</p>` }));

/* 404 */
out("/404.html", textPage({ path: "/404.html", title: "Página não encontrada", h1: "Esse pico não existe", desc: "Página não encontrada.", html: `<p>A página que você procurou não foi encontrada. <a href="${base}/">Voltar para o início</a>.</p>` }));

/* arquivos de apoio */
for (const f of ["style.css", "app.js", "favicon.svg"]) copyFileSync(join(ROOT, "assets", f), join(DIST, f));
writeFileSync(join(DIST, ".nojekyll"), "");
const ufs = Object.keys(UFN).filter(uf => all.some(p => p.uf === uf)).map(uf => {
  const list = all.filter(p => p.uf === uf);
  const cities = [...new Set(list.map(p => p.cidade))].map(c => { const x = list.filter(p => p.cidade === c); return [c, cityPath(x[0]), x.length]; });
  return { uf, nome: UFN[uf], url: ufPath(uf), n: list.length, cities };
});
writeFileSync(join(DIST, "indice.js"), "window.TR_INDEX=" + JSON.stringify({ ufs, picos: all.map(p => [p.id, p.nome, p.cidade, p.uf, p.lat, p.lon, picoPath(p)]) }) + ";");
const hoje = {};
for (const p of all) {
  if (p.poro || p.noWaves) continue;
  const d = p.days[0], t = d.top;
  hoje[p.id] = {
    n: p.nome, c: p.cidade, uf: p.uf, u: picoPath(p),
    t: [t.from, t.to, d.bw.mx, +t.at.H.toFixed(2), t.at.per, Math.round(t.at.swDir), Math.round(t.at.dir), Math.round(t.at.spd), t.at.kind],
    bw: [d.bw.from, d.bw.to], ww: d.ww ? [d.ww.from, d.ww.to, Math.round(d.ww.dir), Math.round(d.ww.spd), d.ww.kind] : null,
    wk: p.days.map(x => [x.bw.mx, +x.bw.at.H.toFixed(2), x.wx.sky])
  };
}
mkdirSync(join(DIST, "dados"), { recursive: true });
writeFileSync(join(DIST, "dados", "hoje.json"), JSON.stringify({ gerado: now.toISOString(), datas: dates, picos: hoje }));
const lastmod = spDate(now);
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(p => `<url><loc>${siteUrl}${p}</loc><lastmod>${lastmod}</lastmod><changefreq>hourly</changefreq></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
if (config.ads.enabled && config.ads.client) writeFileSync(join(DIST, "ads.txt"), `google.com, ${config.ads.client.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`);

console.log(`Pronto: ${urls.length} páginas em dist/ (${all.length} picos).`);
