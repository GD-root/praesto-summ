/* Busca completa: o que o guia já sabia (prefácios, orações, bênçãos, santos, mapa)
   + os números da IGMR + os títulos de todas as páginas do Missal (vindos do Drive). */
import { IGMR, INDICE } from "../dados-grandes";
import { esc, norm, pg } from "../util/html";
import { contarBusca, viewBusca } from "./busca";
import { paginaIGMR } from "./igmr";

interface Achado { n: string; t: string; u: string; p: string; href?: string }

let idxIGMR: { x: string; a: Achado }[] | null = null;
let idxPaginas: { x: string; a: Achado }[] | null = null;

function montar(): void {
  if (IGMR && !idxIGMR) {
    idxIGMR = IGMR.numeros.map((n) => ({
      x: norm("igmr " + n.n + " " + n.capitulo + " " + (n.secao || "") + " " + n.texto),
      a: { n: "IGMR " + n.n, t: (n.secao || n.capitulo).split(" › ").pop()!, u: n.texto.replace(/\n/g, " "), p: paginaIGMR(n), href: "#igmr-" + n.n },
    }));
  }
  if (INDICE && !idxPaginas) {
    idxPaginas = INDICE.paginas.filter((p) => p.tit.length).map((p) => ({
      x: norm((p.cab || "") + " " + p.tit.join(" ")),
      a: { n: p.cab || "Missal", t: p.tit.join(" · "), u: "", p: String(p.p) },
    }));
  }
}

/** Trecho do texto em volta da primeira palavra procurada. */
function trecho(texto: string, termos: string[]): string {
  const t = norm(texto);
  const i = Math.max(0, Math.min(...termos.map((x) => { const k = t.indexOf(x); return k < 0 ? Infinity : k; })));
  let ini = Math.max(0, i - 60);
  if (ini > 0) ini = texto.indexOf(" ", ini) + 1 || ini; /* começa numa palavra inteira */
  let fim = Math.min(texto.length, ini + 180);
  if (fim < texto.length) fim = texto.lastIndexOf(" ", fim) > ini ? texto.lastIndexOf(" ", fim) : fim;
  return (ini > 0 ? "…" : "") + texto.slice(ini, fim).trim() + (fim < texto.length ? "…" : "");
}

function itemHTML(a: Achado, termos: string[]): string {
  const corpo = '<div class="txt"><div class="kind">' + esc(a.n) + '</div><div class="t">' + esc(a.t) + "</div>" + (a.u ? '<div class="u">' + esc(trecho(a.u, termos)) + "</div>" : "") + "</div>" + (a.p ? pg(a.p) : "");
  return a.href ? '<a class="item" href="' + a.href + '">' + corpo + "</a>" : '<div class="item">' + corpo + "</div>";
}

function secao(titulo: string, explicacao: string, achados: Achado[], termos: string[], max: number): string {
  if (!achados.length) return "";
  return "<h2>" + titulo + '</h2><p class="lead">' + achados.length + (achados.length === 1 ? " resultado. " : " resultados. ") + explicacao + (achados.length > max ? " Mostrando os " + max + " primeiros." : "") + '</p><div class="list">' +
    achados.slice(0, max).map((a) => itemHTML(a, termos)).join("") + "</div>";
}

export function viewBuscaCompleta(q: string): string {
  montar();
  const termos = norm(q).split(/\s+/).filter(Boolean);
  const casa = (e: { x: string }) => termos.every((t) => e.x.indexOf(t) >= 0);
  /* "igmr 106" ou só "106" abre direto o número */
  const num = norm(q).match(/^(?:igmr\s*)?(\d{1,3})$/);
  const igmr = (idxIGMR || []).filter(casa).map((e) => e.a);
  if (num && IGMR && +num[1] >= 1 && +num[1] <= IGMR.numeros.length) {
    const alvo = "IGMR " + num[1];
    igmr.sort((a, b) => (a.n === alvo ? -1 : b.n === alvo ? 1 : 0));
  }
  const paginas = (idxPaginas || []).filter(casa).map((e) => e.a);
  const base = contarBusca(q) ? viewBusca(q) : "";
  const extra =
    secao("Na Instrução Geral (IGMR)", "Toque para ler o número inteiro.", igmr, termos, 30) +
    secao("Nos títulos das páginas do Missal", "Títulos de todas as páginas do Missal, lidos do texto guardado no Drive.", paginas, termos, 40);
  if (!base && !extra) return viewBusca(q); /* mensagem de "nada encontrado" */
  const carregando = !idxIGMR ? '<p class="lead">Carregando a IGMR e o índice do Missal…</p>' : "";
  return base + extra + carregando;
}
