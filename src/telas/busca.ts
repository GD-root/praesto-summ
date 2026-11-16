/* Busca em tudo o que o guia sabe sobre o Missal. */
import { CELEB } from "../liturgia/santos";
import { esc, norm, pg } from "../util/html";
import { BEN, MAPA, OE, PREF } from "./missal";

interface Entrada {
  /** tipo, mostrado acima do título */
  k: string;
  t: string;
  u: string;
  p: string | number;
  /** texto normalizado em que se procura */
  x: string;
}

let IDX: Entrada[] | null = null;

function montarIndice(): Entrada[] {
  const idx: Entrada[] = [];
  PREF.forEach((s) => s.grupos.forEach((g) => g.itens.forEach((it) => {
    const uso = it.uso || g.uso || "";
    idx.push({ k: "Prefácio", t: (/prefácio/i.test(it.titulo) ? "" : "Prefácio · ") + g.nome + (it.numeral ? " " + it.numeral : "") + ": " + it.titulo, u: uso, p: it.paginas, x: norm(g.nome + " " + it.numeral + " " + it.titulo + " prefacio " + s.secao + " " + uso) });
  })));
  OE.forEach((f) => f.oracoes.forEach((o) => {
    idx.push({ k: "Oração Eucarística", t: o.nome + " · " + o.subtitulo, u: o.quando, p: o.de + "–" + o.ate, x: norm(o.nome + " " + o.subtitulo + " oracao eucaristica " + f.familia + " " + o.quando) });
  }));
  BEN.forEach((s) => s.grupos.forEach((g) => g.itens.forEach((it) => {
    idx.push({ k: "Bênção", t: it.titulo, u: it.quando || "", p: it.paginas, x: norm(it.titulo + " bencao " + g.nome + " " + s.secao + " " + (it.quando || "")) });
  })));
  CELEB.forEach((c) => idx.push({ k: "Celebração", t: c.nome, u: c.data, p: c.pagina, x: norm(c.nome + " " + c.data) }));
  MAPA.forEach((m) => {
    idx.push({ k: "Parte do Missal", t: m.nome, u: "Páginas " + m.de + " a " + m.ate, p: m.de, x: norm(m.nome) });
    m.subitens.forEach((s) => idx.push({ k: m.nome, t: s.nome, u: "", p: s.pagina, x: norm(s.nome + " " + m.nome) }));
  });
  return idx;
}

export function viewBusca(q: string): string {
  if (!IDX) IDX = montarIndice();
  const termos = norm(q).split(/\s+/).filter(Boolean);
  const res = IDX.filter((e) => termos.every((t) => e.x.indexOf(t) >= 0));
  let h = '<p class="lead">' + (res.length ? res.length + (res.length === 1 ? " resultado" : " resultados") + " para “" + esc(q) + "”." : "") + "</p>";
  if (!res.length) return '<div class="list"><div class="empty">Nada encontrado para “' + esc(q) + "”. Tente uma palavra só, como “Advento”, “mártires” ou o nome do santo.</div></div>";
  h += '<div class="list">' + res.slice(0, 80).map((e) => '<div class="item"><div class="txt"><div class="kind">' + esc(e.k) + '</div><div class="t">' + esc(e.t) + "</div>" + (e.u ? '<div class="u">' + esc(e.u) + "</div>" : "") + "</div>" + pg(e.p) + "</div>").join("") + "</div>";
  if (res.length > 80) h += '<p class="lead">Mostrando os 80 primeiros. Escreva mais uma palavra para afinar.</p>';
  return h;
}
