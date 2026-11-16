/* Pequenas peças de HTML usadas por todas as telas. */
import type { Cor } from "../tipos";

export const CORES: Record<Cor, string> = {
  roxo: "Roxo",
  branco: "Branco",
  verde: "Verde",
  vermelho: "Vermelho",
  varia: "Cor do dia",
};

const ENTIDADES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

/** Escapa texto para entrar com segurança no HTML. */
export function esc(s: unknown): string {
  return String(s).replace(/[&<>"]/g, (c) => ENTIDADES[c]);
}

/** Minúsculas e sem acentos, para a busca. */
export function norm(s: unknown): string {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Etiqueta da página do Missal, sempre à direita do item. */
export function pg(p: string | number): string {
  return '<span class="pg"><small>pág.</small>' + esc(p) + "</span>";
}

export function corHTML(c: Cor, rotulo?: string): string {
  return '<span class="cor ' + c + '" style="--c:var(--' + c + ')"><i></i>' + esc(rotulo || CORES[c]) + "</span>";
}

export const CHEV =
  '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>';

export function p2(n: number): string {
  return (n < 10 ? "0" : "") + n;
}

/** Linha numerada de um roteiro. */
export function passo(txt: string, pagina: string | number, uso: string, n: number | string): string {
  return (
    '<div class="item"><span class="step">' + n + '</span><div class="txt"><div class="t">' + esc(txt) + "</div>" +
    (uso ? '<div class="u">' + esc(uso) + "</div>" : "") + "</div>" + (pagina ? pg(pagina) : "") + "</div>"
  );
}

/** Bonequinho da procissão. */
export function fig(tipo: string, rotulo: string): string {
  return '<span class="fg ' + tipo + '"><i></i>' + esc(tipo === "vago" ? rotulo + " (a definir)" : rotulo) + "</span>";
}

/** Caixa de avisos com um parágrafo por linha. */
export function avisos(lista: string[]): string {
  return '<div class="aviso">' + lista.map((x) => "<p>" + esc(x) + "</p>").join("") + "</div>";
}
