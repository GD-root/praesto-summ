/* "O que é cada objeto": a janela aberta pelo botão redondo da Preparação, com desenho e explicação de cada objeto. */
import glossario from "../dados/glossario.json";
import type { GrupoGlossario, ItemGlossario } from "../tipos";
import { esc } from "../util/html";
import { FIG } from "./figuras";

export const GLOS = glossario as GrupoGlossario[];

/** Objeto pelo id, ou undefined. */
export function itemGlossario(id: string): ItemGlossario | undefined {
  for (const g of GLOS) for (const it of g.itens) if (it.id === id) return it;
  return undefined;
}

/** Desenho do objeto (SVG). */
export function figura(id: string, grande = false): string {
  return `<svg class="fo${grande ? " grande" : ""}" viewBox="0 0 120 120" aria-hidden="true">${FIG[id] || ""}</svg>`;
}

const semAcento = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Lista em quadradinhos, separada por grupos; com filtro, só o que contém o termo. */
export function listaGlossario(filtro = ""): string {
  const t = semAcento(filtro.trim());
  let h = "";
  for (const g of GLOS) {
    const itens = t ? g.itens.filter((it) => semAcento([it.nome, ...(it.outros || []), it.texto].join(" ")).includes(t)) : g.itens;
    if (!itens.length) continue;
    h += `<p class="eyebrow">${esc(g.nome)}</p><div class="gl-grade">` +
      itens.map((it) => `<button type="button" class="gl-item" data-glos="${it.id}">${figura(it.id)}<span>${esc(it.nome)}</span></button>`).join("") + "</div>";
  }
  return h || '<p class="lead">Nenhum objeto com esse nome. Tente outra palavra, como “cálice” ou “turíbulo”.</p>';
}

/** Ficha de um objeto: desenho grande, outros nomes, o que é, como não confundir e dica prática. */
export function detalheGlossario(id: string): string {
  const it = itemGlossario(id);
  if (!it) return "";
  return `<div class="gl-det">${figura(id, true)}
    <h3>${esc(it.nome)}</h3>${it.outros ? `<p class="gl-outros">Também chamado de ${it.outros.map(esc).join(", ")}</p>` : ""}
    <p>${esc(it.texto)}</p>
    ${it.distinguir ? `<div class="gl-caixa"><b>Como não confundir</b><p>${esc(it.distinguir)}</p></div>` : ""}
    ${it.uso ? `<div class="gl-caixa dica"><b>Na prática</b><p>${esc(it.uso)}</p></div>` : ""}
  </div>`;
}
