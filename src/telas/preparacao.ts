/* Preparação do altar: lista de objetos, figura do cálice e lembretes do dia. */
import objetos from "../dados/objetos.json";
import type { GrupoObjetos, ObjetoLiturgico } from "../tipos";
import { diaLiturgico, type DiaLiturgico } from "../liturgia/dia";
import { hojeISO } from "../liturgia/datas";
import { esc } from "../util/html";
import { dataSel, estado } from "../estado";

export const OBJ = objetos as GrupoObjetos[];

/** [marcados, total] dos itens essenciais */
export function essenciais(): [number, number] {
  let t = 0, f = 0;
  OBJ.forEach((g) => g.itens.forEach((it) => { if (it.essencial) { t++; if (estado.marcados[it.id]) f++; } }));
  return [f, t];
}

/** Lembretes que dependem do dia. */
export function lembretes(r: DiaLiturgico, dt: Date): string[] {
  const t = r.tempo, L: string[] = [], santo = r.modo === "s";
  L.push("Cor do dia: " + r.cor[1].toLowerCase() + ". Separe os paramentos e, se usar, o véu do cálice nessa cor.");
  if (!santo && t.chave === "cinzas") L.push("Cinzas numa vasilha e água benta com aspersório: a bênção e a imposição acontecem depois da homilia (Missal, p. 163).");
  if (!santo && t.chave === "ramos") L.push("Ramos para o povo e água benta com aspersório para a bênção dos ramos, antes da procissão (Missal, p. 216).");
  if (t.chave === "ceia") L.push("Lava-pés: jarro, bacia e toalhas. Hóstias suficientes também para a Sexta-feira Santa, véu umeral e o lugar da reposição preparado: a Missa termina com a transladação do Santíssimo (Missal, p. 255).");
  if (t.chave === "paixao") L.push("Hoje não há Missa. O altar começa totalmente despido. Preparar a cruz para a adoração e, para a Comunhão, toalha, corporal e Missal (p. 257).");
  if (t.chave === "sabado") L.push("Vigília Pascal: fogo novo, círio pascal, velas para o povo, turíbulo e a água que será abençoada (Missal, p. 274).");
  if (santo && r.santo?.pagina === 670) L.push("Velas para o povo e água benta com aspersório para a bênção das velas, antes da procissão (Missal, p. 670).");
  if (dt.getUTCDay() === 0 && !r.semMissa && t.chave !== "ramos") L.push("É domingo: o ato penitencial pode dar lugar à bênção e aspersão da água" + (t.tempo === "pas" ? ", muito indicada no Tempo Pascal" : "") + " (Missal, p. 1224). Se o celebrante for fazer, separe a caldeirinha com água e o aspersório.");
  if (!r.semMissa) L.push("Combine com o celebrante se haverá cruz, tochas e incenso. Se houver incenso, acenda o carvão com antecedência.");
  return L;
}

function figuraCalice(): string {
  const M = estado.marcados;
  function parte(id: string, rotulo: string, y: number, forma: string, x1: number): string {
    const on = M[id] ? " on" : "";
    return '<g class="part' + on + '" data-obj="' + id + '" role="button" tabindex="0" aria-label="' + rotulo + (M[id] ? ", marcado" : "") + '"><rect class="hit" x="150" y="' + (y - 13) + '" width="180" height="26"></rect>' + forma +
      '<line class="guia" x1="' + x1 + '" y1="' + y + '" x2="196" y2="' + y + '"></line><circle class="ponta" cx="' + x1 + '" cy="' + y + '" r="2.2"></circle>' +
      '<text x="202" y="' + (y + 4.5) + '">' + (M[id] ? "✓ " : "") + rotulo + "</text></g>";
  }
  return '<svg class="fig" viewBox="0 0 330 248" role="group" aria-label="Cálice preparado, peça por peça">' +
    parte("veu", "Véu (opcional)", 232, '<path class="veu" d="M52 14 H168 L184 238 H36 Z"></path>', 180) +
    parte("corporal", "Corporal", 31, '<rect x="70" y="24" width="80" height="14" rx="2"></rect><line class="dobra" x1="96" y1="24" x2="96" y2="38"></line><line class="dobra" x1="124" y1="24" x2="124" y2="38"></line>', 150) +
    parte("pala", "Pala", 59, '<rect x="74" y="55" width="72" height="8" rx="1.5"></rect>', 146) +
    parte("patena", "Patena e hóstia", 86, '<path d="M62 82 Q110 104 158 82 Z"></path><ellipse class="hostia" cx="110" cy="80" rx="27" ry="3.2"></ellipse>', 156) +
    parte("sanguinho", "Sanguinho", 114, '<path d="M56 110 H164 V134 H154 V118 H66 V134 H56 Z"></path>', 164) +
    parte("calice", "Cálice", 158, '<path d="M72 134 Q72 180 110 182 Q148 180 148 134 Z"></path><rect x="106" y="182" width="8" height="32"></rect><ellipse cx="110" cy="197" rx="10" ry="5"></ellipse><path d="M80 232 Q110 206 140 232 Z"></path>', 147) +
    "</svg>";
}

function itemObj(it: ObjetoLiturgico, r: DiaLiturgico): string {
  const id = it.id;
  let nota = it.uso;
  if (id === "paramentos") nota = "Hoje: " + r.cor[1].toLowerCase() + ". " + nota;
  return '<label class="chk"><input type="checkbox" data-obj="' + id + '"' + (estado.marcados[id] ? " checked" : "") + '><span class="txt"><span class="t">' + esc(it.nome) + (it.essencial ? "" : '<span class="tag">se for usar</span>') + '</span><span class="u">' + esc(nota) + "</span>" +
    (it.lembretes ? '<span class="lemb">' + it.lembretes.map((x) => "<span>" + esc(x) + "</span>").join("") + "</span>" : "") + "</span></label>";
}

export function viewObjetos(): string {
  const dt = dataSel(), r = diaLiturgico(dt), e = essenciais(), L = lembretes(r, dt);
  let h = '<p class="lead">Confira o que precisa estar pronto antes da Missa. Marque cada item conforme for arrumando; os marcados com “se for usar” não contam para o “pronto”. As marcações ficam guardadas neste aparelho.</p>';
  h += '<div class="prog' + (e[0] === e[1] ? " ok" : "") + '"><div><b>' + (e[0] === e[1] ? "Altar preparado" : e[0] + " de " + e[1] + " itens essenciais") + "</b><span>" + esc(r.titulo) + '</span></div><button type="button" class="btn" data-limpar="1">Desmarcar tudo</button></div>';
  h += '<div class="aviso"><b>Lembretes para ' + (estado.calSel === hojeISO() ? "hoje" : "esta data") + "</b>" + L.map((x) => "<p>" + esc(x) + "</p>").join("") + "</div>";
  OBJ.forEach((g) => {
    const f = g.itens.filter((it) => estado.marcados[it.id]).length;
    h += '<p class="eyebrow">' + esc(g.nome) + " · " + f + "/" + g.itens.length + "</p>";
    if (g.uso) h += '<p class="lead">' + esc(g.uso) + "</p>";
    if (g.figura) h += '<div class="chart figbox">' + figuraCalice() + "</div>";
    h += '<div class="list">' + g.itens.map((it) => itemObj(it, r)).join("") + "</div>";
  });
  h += '<p class="lead">Lista montada a partir da Instrução Geral do Missal Romano, n. 117 a 119, 150 e 276 (no Missal, a partir da p. 19). A chave do sacrário e os lembretes da âmbula são costume prático, não norma.</p>';
  return h;
}
