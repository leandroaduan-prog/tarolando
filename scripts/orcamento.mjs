// Calcula o orçamento de um patrocínio.
// Uso: node scripts/orcamento.mjs --onde "cidade:sp/guaruja" --inicio 2026-12-20 --dias 10
//      --onde aceita: brasil | estado:sp | cidade:sp/guaruja | sp/guaruja/tombo (separe vários com vírgula)
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PICOS } from "../src/picos.mjs";
import { carregarPrivado } from "../src/privado.mjs";
import { orcamento } from "../src/preco.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = n => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : null; };
const onde = (arg("onde") || "").split(",").map(s => s.trim()).filter(Boolean);
const inicio = arg("inicio"), dias = Number(arg("dias") || 1);
if (!onde.length || !/^\d{4}-\d{2}-\d{2}$/.test(inicio || "")) {
  console.log('Uso: node scripts/orcamento.mjs --onde "cidade:sp/guaruja" --inicio 2026-12-20 --dias 10');
  process.exit(1);
}
const pv = carregarPrivado(ROOT);
const r = orcamento({ onde, inicio, dias, picos: PICOS, patrocinios: pv.patrocinios, eventos: pv.eventos, audiencia: pv.audiencia, cfg: pv.precos });
const brl = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const br = s => s.split("-").reverse().join("/");
console.log(`\nOrçamento de patrocínio · ${br(r.inicio)} a ${br(r.fim)} (${r.dias} ${r.dias > 1 ? "dias" : "dia"})\n`);
for (const l of r.praias) console.log(`  ${l.praia.padEnd(48)} ${brl(l.total)}`);
if (r.esgotados.length) {
  console.log("\n  Sem vaga no período (5 patrocinadores já ativos):");
  for (const e of r.esgotados) console.log(`  - ${e.praia}: período inteiro livre a partir de ${br(e.livreA)}`);
}
console.log(`\n  Soma das diárias:            ${brl(r.bruto)}`);
if (r.descontoPacote) console.log(`  ${("Desconto " + r.pacote.toLowerCase() + ":").padEnd(29)}-${Math.round(r.descontoPacote * 100)}%`);
if (r.descontoDuracao) console.log(`  ${"Desconto por duração:".padEnd(29)}-${Math.round(r.descontoDuracao * 100)}%`);
console.log(`  TOTAL:                       ${brl(r.total)}\n`);
