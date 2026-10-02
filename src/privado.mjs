// Lê os dados privados (patrocínios, parceiros, eventos, audiência, preços).
// Eles ficam num repositório privado separado, baixado para a pasta ./privado no momento do build.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function pastaPrivada(root) {
  return process.env.PRIVADO_DIR || join(root, "privado");
}
function ler(dir, nome, padrao) {
  const f = join(dir, nome);
  if (!existsSync(f)) return padrao;
  try { return JSON.parse(readFileSync(f, "utf8")); }
  catch (e) { throw new Error(`Erro no arquivo ${nome}: ${e.message}`); }
}
export function carregarPrivado(root) {
  const dir = pastaPrivada(root);
  return {
    dir,
    existe: existsSync(dir),
    patrocinios: ler(dir, "patrocinios.json", []),
    parceiros: ler(dir, "parceiros.json", []),
    eventos: ler(dir, "eventos.json", []),
    audiencia: ler(dir, "audiencia.json", {}),
    precos: ler(dir, "precos.json", {})
  };
}
