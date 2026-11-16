/* Aba IGMR: a Instrução Geral do Missal Romano, número por número, com a página no Missal. */
import type { NumeroIGMR } from "../tipos";
import { IGMR } from "../dados-grandes";
import { CHEV, esc, pg } from "../util/html";
import { estado } from "../estado";

export const CARREGANDO = '<div class="list"><div class="empty">Carregando…</div></div>';

export function paginaIGMR(x: NumeroIGMR): string {
  if (!x.pagina) return "";
  return x.paginaAte ? x.pagina + "–" + x.paginaAte : String(x.pagina);
}

function resumo(texto: string, max = 110): string {
  const t = texto.replace(/\n/g, " ");
  return t.length > max ? t.slice(0, t.lastIndexOf(" ", max)) + "…" : t;
}

function itemNumero(x: NumeroIGMR): string {
  return '<a class="item ig" href="#igmr-' + x.n + '"><span class="num">' + x.n + '</span><div class="txt"><div class="u">' + esc(resumo(x.texto)) + "</div></div>" + (x.pagina ? pg(paginaIGMR(x)) : "") + "</a>";
}

/** Texto de um número: cada linha vira um parágrafo; as alíneas a), b)... ficam recuadas. */
function textoHTML(t: string): string {
  return t.split("\n").map((l) => (/^[a-z]\)\s/.test(l) ? '<p class="alinea">' : "<p>") + esc(l) + "</p>").join("");
}

function cartao(x: NumeroIGMR, total: number): string {
  return '<article class="oe ig-cartao" id="igmr-aberto"><div class="head"><h3>IGMR&nbsp;' + x.n + "<small>" + esc(x.capitulo) + (x.secao ? " · " + esc(x.secao) : "") + "</small></h3>" + (x.pagina ? pg(paginaIGMR(x)) : "") + "</div>" +
    textoHTML(x.texto) +
    '<div class="acoes">' +
    (x.n > 1 ? '<a class="btn" href="#igmr-' + (x.n - 1) + '" aria-label="Número anterior">‹ ' + (x.n - 1) + "</a>" : "") +
    '<a class="btn" href="#igmr">Índice</a>' +
    (x.n < total ? '<a class="btn" href="#igmr-' + (x.n + 1) + '" aria-label="Próximo número">' + (x.n + 1) + " ›</a>" : "") +
    "</div></article>";
}

export function viewIGMR(): string {
  if (!IGMR) return CARREGANDO;
  const nums = IGMR.numeros, total = nums.length;
  const sel = estado.igmrSel >= 1 && estado.igmrSel <= total ? nums[estado.igmrSel - 1] : null;
  let h = "";
  if (sel) h += cartao(sel, total);
  h += '<p class="lead">A Instrução Geral do Missal Romano reúne as normas da celebração da Missa em ' + total + " números. No Missal ela fica no começo, da p. 19 à 66; a etiqueta à direita mostra a página de cada número. Para procurar uma palavra, use a busca no alto.</p>";
  h += '<form class="ctl ig-ir" data-igmr-ir="1"><label for="igmr-n">Ir para o número</label><input id="igmr-n" type="number" inputmode="numeric" min="1" max="' + total + '" placeholder="1 a ' + total + '"><button type="submit" class="btn">Abrir</button></form>';
  /* um grupo por capítulo */
  const caps: { nome: string; itens: NumeroIGMR[] }[] = [];
  nums.forEach((x) => {
    if (!caps.length || caps[caps.length - 1].nome !== x.capitulo) caps.push({ nome: x.capitulo, itens: [] });
    caps[caps.length - 1].itens.push(x);
  });
  caps.forEach((c) => {
    const [titulo, sub] = c.nome.split(" · ");
    const aberto = sel && c.itens.includes(sel) ? " open" : "";
    h += '<details class="grp"' + aberto + '><summary><span class="dot"></span><span class="gname"><b>' + esc(sub ? titulo + ": " + sub : titulo) + "</b><small>n. " + c.itens[0].n + " a " + c.itens[c.itens.length - 1].n + "</small></span>" + CHEV + '</summary><div class="items">';
    let secao = "";
    c.itens.forEach((x) => {
      const s = x.secao || "";
      if (s !== secao) { secao = s; if (s) h += '<div class="item ig-secao"><div class="txt"><div class="kind">' + esc(s) + "</div></div></div>"; }
      h += itemNumero(x);
    });
    h += "</div></details>";
  });
  h += '<p class="lead">Texto: ' + esc(IGMR.fonte) + "</p>";
  return h;
}

/* ---------- Referências à IGMR dentro das outras telas viram links ---------- */

const LISTA = String.raw`\d{1,3}(?:\s+a\s+\d{1,3})?(?:(?:,\s*|\s+e\s+)\d{1,3}(?:\s+a\s+\d{1,3})?)*`;
/* "IGMR 106", "Instrução Geral do Missal Romano, n. 117", "Instrução Geral (n. 339)" e "(n. 106)": no app, "n." é sempre número da IGMR */
const REFERENCIA = new RegExp(String.raw`(IGMR\s+|Instrução Geral(?: do Missal Romano)?,?\s*\(?n\.\s*|\(n\.\s*)(` + LISTA + ")", "g");

function ligarLista(lista: string): string {
  return lista.replace(/\d{1,3}/g, (n) => (+n >= 1 && +n <= 399 ? '<a class="ref-igmr" href="#igmr-' + n + '">' + n + "</a>" : n));
}

/** Põe links em "IGMR 106", "IGMR 100 e 187 a 193", "Instrução Geral do Missal Romano, n. 117 a 119"... só no texto, nunca dentro das etiquetas HTML. */
export function ligarIGMR(html: string): string {
  let dentroDeLink = 0; /* link dentro de link não vale em HTML */
  return html.split(/(<[^>]+>)/).map((parte) => {
    if (parte.startsWith("<")) {
      if (/^<a[\s>]/i.test(parte)) dentroDeLink++;
      else if (/^<\/a>/i.test(parte)) dentroDeLink = Math.max(0, dentroDeLink - 1);
      return parte;
    }
    return dentroDeLink ? parte : parte.replace(REFERENCIA, (_, prefixo: string, lista: string) => prefixo + ligarLista(lista));
  }).join("");
}
