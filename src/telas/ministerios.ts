/* Ministérios: equipe da celebração, procissão de entrada e procissão com o Santíssimo. */
import ministerios from "../dados/ministerios.json";
import type { DadosMinisterios, Opcao } from "../tipos";
import { diaLiturgico } from "../liturgia/dia";
import { esc, fig, passo, avisos } from "../util/html";
import { dataSel, estado, type Corpo } from "../estado";

export const MIN = ministerios as DadosMinisterios;

type Veste = "aco" | "cor" | "vago";

interface Fila {
  n: string;
  f: string[];
  u?: string;
  palio?: boolean;
  topo?: string[];
  base?: string[];
}

/** Distribui acólitos e coroinhas pelas funções: tira do grupo preferido e, se faltar, do outro. */
function distribuidor(c: Corpo) {
  const st = { ac: c.acolitos, co: c.coroinhas, falta: 0 };
  function um(pref: "aco" | "cor"): Veste {
    const o = pref === "aco" ? ["aco", "cor"] : ["cor", "aco"];
    for (let i = 0; i < 2; i++) {
      if (o[i] === "aco" && st.ac > 0) { st.ac--; return "aco"; }
      if (o[i] === "cor" && st.co > 0) { st.co--; return "cor"; }
    }
    st.falta++;
    return "vago";
  }
  return { st, um };
}

/** Mitra e báculo: dois ministros com a mesma veste, que seguem atrás do bispo. */
function insignias(um: (p: "aco" | "cor") => Veste, ac: number, co: number): [Veste, Veste] {
  const par = co >= 2 ? "cor" : ac >= 2 ? "aco" : "";
  return par ? [um(par), um(par)] : [um("aco"), um("cor")];
}

function chipsHTML(lista: Opcao[], c: Corpo): string {
  return '<div class="tgl">' + lista.map((k) => '<label class="chip tg' + (c[k.id] ? " on" : "") + '"><input type="checkbox" data-corpo-t="' + k.id + '"' + (c[k.id] ? " checked" : "") + ">" + k.nome + "</label>").join("") + "</div>";
}

export function santissimo(c: Corpo) {
  const { st, um } = distribuidor(c);
  const linhas: Fila[] = [], notas: string[] = [];
  let tu: Veste | null = null, na: Veste | null = null, t1: Veste | null = null, t2: Veste | null = null, si: Veste | null = null;
  if (c.sIncenso) { tu = um("aco"); na = um("cor"); }
  if (c.sTochas) {
    const par = st.co >= 2 ? "cor" : st.ac >= 2 ? "aco" : "";
    if (par) { t1 = um(par); t2 = um(par); } else { t1 = um("aco"); t2 = um("cor"); }
  }
  if (c.sSineta) si = um("cor");
  const ins = c.bispo ? insignias(um, st.ac, st.co) : null;
  if (si) linhas.push({ n: "Sineta", f: [fig(si, "Sineta")], u: "Vai à frente e toca em intervalos, avisando que o Santíssimo se aproxima." });
  if (c.sCerimProc) linhas.push({ n: "Cerimoniário de procissão", f: [fig("cer", "Cerim. de procissão")], u: "Abre o caminho e conduz o ritmo da procissão." });
  if (c.sCerim && !c.cAtras) linhas.push({ n: "Mestre de cerimônias", f: [fig("cer", "Mestre de cerimônias")], u: "Perto do Santíssimo, para orientar o sacerdote e os ministros." });
  if (tu) linhas.push({ n: "Incenso", f: [fig(tu, "Turíbulo"), fig(na!, "Naveta")], u: "Logo à frente do Santíssimo, com o turíbulo fumegando." });
  const meio: string[] = [];
  if (t1) meio.push(fig(t1, "Tocha"));
  meio.push(fig("pad pres", "Santíssimo"));
  if (t2) meio.push(fig(t2, "Tocha"));
  const uMeio = "No centro, " + (c.bispo ? "o bispo" : "o sacerdote") + " leva o ostensório com o véu umeral." + (t1 ? " As tochas vão uma de cada lado do Santíssimo." : "");
  if (c.sPalio) linhas.push({ palio: true, n: "Santíssimo sob o pálio", topo: [fig("vara", "Vara do pálio"), fig("vara", "Vara do pálio")], f: meio, base: [fig("vara", "Vara do pálio"), fig("vara", "Vara do pálio")], u: uMeio + " Quatro pessoas seguram as varas, uma em cada canto, e andam no passo do sacerdote." });
  else linhas.push({ n: "Santíssimo Sacramento", f: meio, u: uMeio });
  const atras: string[] = [];
  if (ins) atras.push(fig(ins[0], "Mitra"), fig("cer", "Cerim. do bispo"), fig(ins[1], "Báculo"));
  if (c.sCerim && c.cAtras) atras.push(fig("cer", "Mestre de cerimônias"));
  if (atras.length) linhas.push({ n: "Atrás do Santíssimo", f: atras, u: ins ? "O bispo leva o Santíssimo sem mitra e sem báculo: os dois ministros das insígnias seguem logo atrás, com o cerimoniário dele." : "O mestre de cerimônias segue logo atrás do sacerdote." });
  if (st.falta) notas.push((st.falta === 1 ? "Falta 1 pessoa" : "Faltam " + st.falta + " pessoas") + " entre acólitos e coroinhas para as funções escolhidas (marcadas como “a definir”).");
  if (c.sPalio) notas.push("O pálio precisa de mais 4 pessoas, além dos acólitos e coroinhas: uma para cada vara.");
  const total = (c.sIncenso ? 2 : 0) + (c.sTochas ? 2 : 0) + (c.sSineta ? 1 : 0) + (c.sCerim ? 1 : 0) + (c.sCerimProc ? 1 : 0) + (c.bispo ? 3 : 0) + (c.sPalio ? 4 : 0);
  return { linhas, notas, total };
}

function santissimoHTML(c: Corpo): string {
  const p = santissimo(c);
  let h = '<h2>Procissão com o Santíssimo</h2><p class="lead">Mais reservada que a de entrada: só quem tem função acompanha o Santíssimo. Escolha o que vai ser usado. ' + p.total + (p.total === 1 ? " pessoa" : " pessoas") + " além do sacerdote.</p>";
  h += chipsHTML(MIN.santissimo, c);
  if (p.notas.length) h += avisos(p.notas);
  h += '<div class="chart proc cor-branco"><div class="rumo">↑ Frente da procissão</div>' +
    p.linhas.map((l) => {
      const corpo = l.palio
        ? '<div class="palio"><div class="figs">' + l.topo!.join("") + '</div><div class="figs">' + l.f.join("") + '</div><div class="figs">' + l.base!.join("") + "</div></div>"
        : '<div class="figs">' + l.f.join("") + "</div>";
      return '<div class="fila"><div class="kind">' + esc(l.n) + "</div>" + corpo + (l.u ? '<div class="u">' + esc(l.u) + "</div>" : "") + "</div>";
    }).join("") + '<div class="rumo">↓ Fim da procissão</div></div>';
  h += '<p class="lead">Para separar: ostensório, véu umeral, capa (pluvial) se for usada, corporal no altar da adoração' + (c.sPalio ? ", pálio com as quatro varas" : "") + (c.sSineta ? ", sineta" : "") + (c.sIncenso ? ", turíbulo e naveta com carvão aceso" : "") + ". Esta ordem segue o costume das procissões eucarísticas; ela não está no Missal, então combine com o celebrante.</p>";
  return h;
}

export function procissao(c: Corpo) {
  const { st, um } = distribuidor(c);
  const linhas: Fila[] = [], notas: string[] = [];
  if (c.cProc) linhas.push({ n: "Cerimoniário de procissão", f: [fig("cer", "Cerim. de procissão")], u: "Vai à frente ou ao lado da fila, abrindo o caminho e marcando o passo de todos." });
  /* Incenso: o turíbulo com um acólito; a naveta com um coroinha, se houver */
  if (c.incenso) { const tu = um("aco"), na = um("cor"); linhas.push({ n: "Incenso", f: [fig(tu, "Turíbulo"), fig(na, "Naveta")], u: "Vão à frente, com o turíbulo fumegando." }); }
  /* Cruz e tochas: as duas tochas sempre com a mesma veste; a cruz, de preferência, com um acólito */
  if (c.cruz || c.tochas) {
    let cz: Veste | null = null, t1: Veste | null = null, t2: Veste | null = null, par: "" | "aco" | "cor" = "";
    if (c.tochas) {
      const acLivre = st.ac - (c.cruz && st.ac > 0 ? 1 : 0);
      if (st.co >= 2 && (st.ac >= 1 || !c.cruz || st.co >= 3)) par = "cor"; /* coroinhas nas tochas (acólito na cruz, se houver) */
      else if (acLivre >= 2) par = "aco"; /* acólitos nas tochas e na cruz */
      else if (st.co >= 2) par = "cor";
      else if (st.ac >= 2) par = "aco";
    }
    if (c.tochas && par) { t1 = um(par); t2 = um(par); }
    if (c.cruz) cz = um("aco");
    if (c.tochas && !par) {
      t1 = um("aco"); t2 = um("cor");
      if (t1 !== "vago" && t2 !== "vago" && t1 !== t2) notas.push("Só há um acólito e um coroinha livres para as tochas, então elas ficam com vestes diferentes. Com mais uma pessoa, o par fica igual.");
    }
    const f: string[] = [];
    if (t1) f.push(fig(t1, "Tocha"));
    if (cz) f.push(fig(cz, "Cruz"));
    if (t2) f.push(fig(t2, "Tocha"));
    let expl = c.cruz ? "A cruz vai com a imagem do Crucificado voltada para a frente." : "";
    if (c.tochas && par) expl += (expl ? " " : "") + "As duas tochas vão com a mesma veste" + (c.cruz && cz !== "vago" && cz !== par ? ", e a cruz com " + (cz === "aco" ? "um acólito" : "um coroinha") + ", para dar destaque." : ".");
    linhas.push({ n: c.cruz && c.tochas ? "Cruz entre as tochas" : c.cruz ? "Cruz" : "Tochas", f, u: expl });
  }
  const ins = c.bispo ? insignias(um, st.ac, st.co) : null;
  function pares(n: number, tipo: string, rot: string, nome: string, u?: string) {
    for (let i = 0; i < n; i += 2) linhas.push({ n: i === 0 ? nome : "", f: n - i >= 2 ? [fig(tipo, rot), fig(tipo, rot)] : [fig(tipo, rot)], u: i + 2 >= n ? u || "" : "" });
  }
  /* coroinhas e acólitos que sobraram depois do incenso, da cruz, das tochas e das insígnias */
  pares(st.co, "cor", "Coroinha", "Coroinhas, dois a dois");
  pares(st.ac, "aco", "Acólito", "Acólitos, dois a dois");
  if (c.cAltar) linhas.push({ n: "Cerimoniário do altar", f: [fig("cer", "Cerim. do altar")], u: "Vai com os acólitos. Cuida da credência e do altar na Liturgia Eucarística." });
  pares(c.ministros || 0, "min", "Ministro", "Ministros da Eucaristia, dois a dois", "Entrar na procissão é opcional: eles também podem ficar na assembleia e se aproximar do altar só na hora da Comunhão.");
  const leit = c.leitores, levaLeitor = c.evang && !c.diacono && leit > 0;
  if (leit > 0 || c.cPalavra) {
    const fl: string[] = [];
    if (c.cPalavra) fl.push(fig("cer", "Cerim. da Palavra"));
    for (let i = 0; i < leit; i++) fl.push(fig("lei", levaLeitor && i === leit - 1 ? "Leitor com o Evangeliário" : "Leitor"));
    linhas.push({ n: leit > 0 ? "Leitores" : "Cerimoniário da Palavra", f: fl, u: (levaLeitor ? "Na falta do diácono, um leitor leva o Evangeliário um pouco elevado e caminha logo à frente dos sacerdotes. " : "") + (c.cPalavra ? "O cerimoniário da Palavra acompanha os leitores e cuida do ambão, do Lecionário e do Evangeliário." : "") });
  }
  if (c.diacono && c.evang) linhas.push({ n: "Diácono", f: [fig("dia", "Diácono com o Evangeliário")], u: "Leva o Evangeliário um pouco elevado, à frente do sacerdote." });
  pares(c.conc, "pad", "Concelebrante", "Concelebrantes, dois a dois");
  const fim: string[] = [];
  if (c.cMestre && !c.cAtras) fim.push(fig("cer", "Mestre de cerimônias"));
  fim.push(fig("pad pres", c.bispo ? "Bispo" : "Presidente"));
  if (c.diacono && !c.evang) fim.push(fig("dia", "Diácono"));
  linhas.push({ n: c.bispo ? "Bispo, presidente da celebração" : "Presidente da celebração", f: fim, u: (c.bispo ? "O bispo entra de mitra e com o báculo na mão. " : "") + (c.diacono && !c.evang ? "Sem o Evangeliário, o diácono caminha ao lado " + (c.bispo ? "do bispo" : "do sacerdote") + ". " : "") + (c.cMestre && !c.cAtras ? "O mestre de cerimônias vai junto do presidente, um pouco à frente." : "") });
  const atras: string[] = [];
  if (ins) atras.push(fig(ins[0], "Mitra"), fig("cer", "Cerim. do bispo"), fig(ins[1], "Báculo"));
  if (c.cMestre && c.cAtras) atras.push(fig("cer", "Mestre de cerimônias"));
  if (atras.length) linhas.push({ n: c.bispo ? "Atrás do bispo" : "Atrás do presidente", f: atras, u: (ins ? "Os dois ministros das insígnias seguem atrás do bispo, com o véu de ombros, para receber a mitra e o báculo; com eles vai o cerimoniário do bispo. " : "") + (c.cMestre && c.cAtras ? "O mestre de cerimônias fecha a procissão, logo atrás do presidente." : "") });
  if (st.falta) notas.push((st.falta === 1 ? "Falta 1 pessoa" : "Faltam " + st.falta + " pessoas") + " para as funções escolhidas (marcadas como “a definir”). Aumente a equipe ou desmarque alguma função.");
  if (c.evang && !c.diacono && !leit) notas.push("Sem diácono e sem leitor na procissão, o Evangeliário já fica sobre o altar antes da Missa.");
  if (c.incenso && !c.cruz) notas.push("Com incenso, o costume é levar também a cruz e as velas.");
  const total = c.coroinhas + c.acolitos + (c.ministros || 0) + c.leitores + c.conc + (c.cMestre ? 1 : 0) + (c.cProc ? 1 : 0) + (c.cPalavra ? 1 : 0) + (c.cAltar ? 1 : 0) + (c.bispo ? 1 : 0) + c.diacono + 1;
  return { linhas, notas, total, falta: st.falta };
}

export function viewCorpo(): string {
  const c = estado.corpo, p = procissao(c), r = diaLiturgico(dataSel());
  let h = '<p class="lead">Monte a equipe da celebração e veja a ordem da procissão de entrada, como a Instrução Geral do Missal Romano a descreve. A escolha fica guardada neste aparelho.</p>';
  h += '<div class="list">' + MIN.contagens.map((f) =>
    '<div class="item cnt"><div class="txt"><div class="t">' + f.nome + '</div></div><div class="stp"><button type="button" class="btn" data-corpo="' + f.id + '" data-d="-1" aria-label="Menos ' + f.nome + '"' + (c[f.id] <= 0 ? " disabled" : "") + ">−</button><b>" + c[f.id] +
    '</b><button type="button" class="btn" data-corpo="' + f.id + '" data-d="1" aria-label="Mais ' + f.nome + '"' + (c[f.id] >= f.max ? " disabled" : "") + ">+</button></div></div>").join("") + "</div>";
  MIN.grupos.forEach((g) => (h += '<p class="eyebrow">' + g.nome + "</p>" + chipsHTML(g.opcoes, c)));
  h += '<h2>Procissão de entrada</h2><p class="lead">' + p.total + " pessoas, da frente para o fim. Cor litúrgica dos ministros ordenados hoje: " + esc(r.cor[1].toLowerCase()) + ".</p>";
  if (p.notas.length) h += avisos(p.notas);
  h += '<div class="chart proc cor-' + r.cor[0] + '"><div class="rumo">↑ Altar (frente da procissão)</div>' +
    p.linhas.map((l) => '<div class="fila">' + (l.n ? '<div class="kind">' + esc(l.n) + "</div>" : "") + '<div class="figs">' + l.f.join("") + "</div>" + (l.u ? '<div class="u">' + esc(l.u) + "</div>" : "") + "</div>").join("") +
    '<div class="rumo">↓ Porta da igreja (fim da procissão)</div></div>';
  if (c.ador) h += santissimoHTML(c);
  h += '<div class="tgl leg">' + fig("cor", "Coroinha: túnica vermelha e sobrepeliz") + fig("aco", "Acólito: batina preta e sobrepeliz") + fig("min", "Ministro da Eucaristia") + fig("cer", "Cerimoniário") + fig("lei", "Leitor") + fig("dia", "Diácono") + fig("pad", "Sacerdote") + "</div>";
  h += '<h2>Ao chegar ao altar</h2><div class="list">' +
    passo("Reverência", "", "Todos fazem inclinação profunda ao altar (ou genuflexão, se o sacrário estiver no presbitério). Quem leva a cruz, as tochas ou o Evangeliário não faz genuflexão.", 1) +
    passo("Cruz e tochas", "", "A cruz fica junto do altar, como cruz do altar, ou é guardada em lugar digno. As tochas ficam sobre o altar, perto dele ou na credência.", 2) +
    passo("Evangeliário", "", "É colocado sobre o altar, de onde sai em procissão para o ambão na hora do Evangelho.", 3) +
    (c.incenso ? passo("Incenso", "", "O sacerdote põe incenso no turíbulo e incensa a cruz e o altar. O turiferário e o naveteiro esperam ao lado.", 4) : "") +
    passo("Lugares", "", "Cada um vai para o seu lugar. Acólitos e coroinhas ficam perto da credência, sem ocupar os lugares dos concelebrantes e do diácono.", c.incenso ? 5 : 4) + "</div>";
  h += '<h2>Quem faz o quê</h2><div class="list">' +
    (c.cMestre ? passo("Mestre de cerimônias", "", "Organiza toda a celebração para que se faça com decoro, ordem e piedade. Fica junto do presidente e avisa cada ministro da sua vez (IGMR 106).", "•") : "") +
    (c.cProc ? passo("Cerimoniário de procissão", "", "Forma a fila na sacristia, dá o sinal de saída e conduz as procissões: entrada, Evangelho, oferendas e saída.", "•") : "") +
    (c.cPalavra ? passo("Cerimoniário da Palavra", "", "Cuida do ambão: deixa o Lecionário marcado, acompanha os leitores e a procissão do Evangeliário.", "•") : "") +
    (c.cAltar ? passo("Cerimoniário do altar", "", "Cuida da credência e do altar: preparação das oferendas, lavabo, sineta, purificação e a ordem dos ministros na Comunhão.", "•") : "") +
    (c.bispo ? passo("Cerimoniário do bispo, mitra e báculo", "", "O cerimoniário do bispo fica sempre com ele. Os dois ministros das insígnias seguram a mitra e o báculo com o véu de ombros e os entregam nos momentos certos.", "•") : "") +
    (c.diacono ? passo("Diácono", "", "Proclama o Evangelho, ajuda o sacerdote no altar, prepara o cálice, convida ao gesto da paz e despede o povo (IGMR 171 a 186).", "•") : "") +
    passo("Acólitos e coroinhas", "", "Servem ao altar e ajudam o sacerdote e o diácono: levam a cruz, as velas, o turíbulo, o pão, o vinho e a água, apresentam o Missal e o lavabo (IGMR 100 e 187 a 193).", "•") +
    (c.ministros ? passo("Ministros da Eucaristia", "", "Ajudam a distribuir a Comunhão quando faltam ministros ordenados. Só se aproximam do altar depois que o sacerdote comunga, e recebem dele o vaso com as hóstias (IGMR 162). Combine antes a posição de cada um na distribuição.", "•") : "") +
    (c.leitores ? passo("Leitores", "", "Proclamam as leituras antes do Evangelho; na falta de salmista e de diácono, também o salmo e as intenções da oração dos fiéis (IGMR 194 a 198).", "•") : "") +
    (c.incenso ? passo("Turíbulo e naveta", "", "Momentos do incenso: procissão de entrada, incensação do altar, Evangelho, oferendas e as duas elevações depois da consagração (IGMR 276).", "•") : "") + "</div>";
  h += '<p class="lead">A ordem da procissão segue a Instrução Geral do Missal Romano, n. 120, 172, 194 e 210. As cores das vestes de coroinhas e acólitos são costume das comunidades: a Instrução Geral (n. 339) só pede alva ou outra veste aprovada. A divisão em vários cerimoniários também é costume: a Instrução Geral fala só do mestre de cerimônias (n. 106).</p>';
  return h;
}
