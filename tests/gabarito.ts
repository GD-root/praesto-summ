/* Lê o gabarito gravado a partir da versão 14 (o index.html único, antes da migração para TypeScript). */
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

export function lerGabarito<T>(nome: string): T {
  const arq = fileURLToPath(new URL("./gabarito/" + nome + ".json.gz", import.meta.url));
  return JSON.parse(gunzipSync(readFileSync(arq)).toString("utf8")) as T;
}

type Obj = Record<string, unknown>;

/* Na versão 14 os campos tinham nomes curtos; aqui eles passam para os nomes novos. */
const NOMES_TEMPO: Record<string, string> = {
  t: "tempo", k: "chave", p: "pagina", rk: "precedencia", sem: "semana", dom: "domingo", sol: "solenidade",
  com: "comunhaoPropria", oit: "oitava", ss: "semanaSanta", tarde: "fimDoAdvento", depoisEpi: "depoisEpifania", depoisAsc: "depoisAscensao",
};
const NOMES_SANTO: Record<string, string> = { n: "nome", p: "pagina", r: "grau", rk: "precedencia" };
const NOMES_DIA: Record<string, string> = { t: "tempo", s: "santo", p: "pagina", pref: "prefacio", ben: "bencao", oe: "oracaoEucaristica" };

/** Campos sim/não: 1, true e false viram booleanos, e o "não" é tirado (ausente = não). */
const SIM_NAO = new Set([
  "domingo", "solenidade", "festa", "comunhaoPropria", "oitava", "semanaSanta", "semMissa", "fimDoAdvento",
  "depoisEpifania", "depoisAscensao", "maria", "gloria", "creio",
]);

function renomear(o: Obj, nomes: Record<string, string>): Obj {
  const r: Obj = {};
  for (const [k, v] of Object.entries(o)) {
    const nk = nomes[k] || k;
    if (SIM_NAO.has(nk)) { if (v) r[nk] = true; }
    else if (v !== undefined) r[nk] = v;
  }
  return r;
}

export function normalizarAntigo(r: Obj): Obj {
  const n = renomear(r, NOMES_DIA);
  n.tempo = renomear(r.t as Obj, NOMES_TEMPO);
  if (r.s) n.santo = renomear(r.s as Obj, NOMES_SANTO);
  n.outros = (r.outros as Obj[]).map((x) => renomear(x, NOMES_SANTO));
  return n;
}

/** Aplica a mesma limpeza ao resultado novo (tira os "não" e os campos vazios). */
export function normalizarNovo(r: object): Obj {
  return JSON.parse(JSON.stringify(r, (k, v) => (SIM_NAO.has(k) && !v ? undefined : v)));
}
