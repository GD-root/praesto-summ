/* Abas do Missal que só consultam os dados: Prefácios, Orações, Bênçãos, Santos e Mapa. */
import prefacios from "../dados/prefacios.json";
import oracoes from "../dados/oracoes-eucaristicas.json";
import bencaos from "../dados/bencaos.json";
import mapa from "../dados/mapa.json";
import type { FamiliaOracoes, GrupoPrefacios, ParteMissal, Prefacio, SecaoBencaos, SecaoPrefacios } from "../tipos";
import { CELEB } from "../liturgia/santos";
import { MESES, MESES_L } from "../liturgia/datas";
import { CHEV, CORES, corHTML, esc, pg } from "../util/html";
import { estado } from "../estado";

export const PREF = prefacios as SecaoPrefacios[];
export const OE = oracoes as FamiliaOracoes[];
export const BEN = bencaos as SecaoBencaos[];
export const MAPA = mapa as ParteMissal[];

function prefItem(g: GrupoPrefacios, it: Prefacio): string {
  const uso = it.uso || g.uso || "", cor = it.cor || g.cor;
  return (
    '<div class="item"><div class="txt"><div class="t">' + (it.numeral ? '<span class="num">' + esc(it.numeral) + "</span>" : "") + esc(it.titulo) +
    (it.brasil ? '<span class="tag">Brasil</span>' : "") + "</div>" + (uso ? '<div class="u">' + esc(uso) + "</div>" : "") + corHTML(cor) + "</div>" + pg(it.paginas) + "</div>"
  );
}

export function viewPrefacios(): string {
  let total = 0;
  PREF.forEach((s) => s.grupos.forEach((g) => (total += g.itens.length)));
  let h = '<p class="lead">' + total + " prefácios, agrupados como no índice do Missal. Abra um grupo para ver cada prefácio, a página e quando usar. A bolinha mostra a cor litúrgica habitual.</p>";
  PREF.forEach((s) => {
    h += '<p class="eyebrow">' + esc(s.secao) + "</p>";
    s.grupos.forEach((g) => {
      const faixa = g.itens.length > 1 ? g.itens.length + " prefácios" : "1 prefácio";
      h += '<details class="grp"><summary><span class="dot ' + g.cor + '" style="--c:var(--' + g.cor + ')"></span><span class="gname"><b>' + esc(g.nome) + "</b><small>" + faixa + " · " + CORES[g.cor] + "</small></span>" + CHEV + '</summary><div class="items">' +
        g.itens.map((it) => prefItem(g, it)).join("") + "</div></details>";
    });
  });
  return h;
}

function rotuloCurto(nome: string): string {
  return nome.replace("Oração Eucarística", "OE").replace("Diversas Circunstâncias", "Div. Circ.").replace("Missas com crianças", "Crianças");
}

export function viewOracoes(): string {
  const all = OE.flatMap((f) => f.oracoes);
  const max = Math.max(...all.map((o) => o.ate - o.de + 1));
  let h = '<p class="lead">As ' + all.length + " Orações Eucarísticas do Missal: onde estão, o que cada uma tem de próprio e quando convém usar.</p>";
  h += '<div class="chart"><h3>Tamanho de cada oração</h3><p class="cap">Em páginas do Missal, contando rubricas e música. Toque para ir ao cartão.</p><div class="bars">' +
    all.map((o, i) => {
      const n = o.ate - o.de + 1;
      return '<button type="button" class="bar" data-go="oe' + i + '"><span class="l">' + esc(rotuloCurto(o.nome)) + '</span><span class="track"><span class="fill" style="width:' + (n / max) * 100 + '%"></span></span><span class="v">' + n + " pág.</span></button>";
    }).join("") + "</div></div>";
  let k = 0;
  OE.forEach((f) => {
    h += '<p class="eyebrow">' + esc(f.familia) + "</p>";
    f.oracoes.forEach((o) => {
      h += '<article class="oe" id="oe' + k++ + '"><div class="head"><h3>' + esc(o.nome) + (o.brasil ? '<span class="tag" style="font-family:var(--body)">Brasil</span>' : "") + "<small>" + esc(o.subtitulo) + "</small></h3>" + pg(o.de + "–" + o.ate) +
        "</div><p>" + esc(o.resumo) + "</p><dl><dt>Quando</dt><dd>" + esc(o.quando) + "</dd><dt>Prefácio</dt><dd>" + esc(o.prefacio) + "</dd></dl></article>";
    });
  });
  return h;
}

export function viewBencaos(): string {
  let total = 0;
  BEN.forEach((s) => s.grupos.forEach((g) => (total += g.itens.length)));
  let h = '<p class="lead">As bênçãos que o Missal traz, em ' + total + " entradas: as do fim da Missa, as que pertencem a um dia do ano e as de objetos e pessoas. Abra um grupo para ver a página e quando usar.</p>";
  BEN.forEach((s) => {
    h += '<p class="eyebrow">' + esc(s.secao) + "</p>";
    s.grupos.forEach((g) => {
      h += '<details class="grp"><summary><span class="dot ' + g.cor + '" style="--c:var(--' + g.cor + ')"></span><span class="gname"><b>' + esc(g.nome) + "</b><small>" + (g.itens.length > 1 ? g.itens.length + " entradas" : "1 entrada") + "</small></span>" + CHEV + '</summary><div class="items">' +
        (g.uso ? '<div class="item"><div class="txt"><div class="u" style="margin:0">' + esc(g.uso) + "</div></div></div>" : "") +
        g.itens.map((it) => '<div class="item"><div class="txt"><div class="t">' + esc(it.titulo) + "</div>" + (it.quando ? '<div class="u">' + esc(it.quando) + "</div>" : "") + "</div>" + pg(it.paginas) + "</div>").join("") + "</div></details>";
    });
  });
  h += '<div class="aviso"><b>O que não está no Missal.</b> As bênçãos de objetos em geral (terços, imagens, medalhas, casas, veículos, alimentos) e de pessoas fora da Missa ficam em outro livro, o Ritual de Bênçãos. O Missal só traz as bênçãos que acontecem dentro da Missa, listadas acima.</div>';
  return h;
}

export function viewSantos(): string {
  if (!estado.mesSel) estado.mesSel = new Date().getMonth() + 1;
  const mesSel = estado.mesSel;
  const cont = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const vistos = new Set<string>();
  CELEB.forEach((c) => {
    if (!c.mes) return;
    const key = c.mes + "-" + c.dia + "-" + c.pagina;
    if (!vistos.has(key)) { vistos.add(key); cont[c.mes - 1]++; }
  });
  const max = Math.max(...cont);
  let h = '<p class="lead">Celebrações do Próprio dos Santos e festas do Senhor e de Nossa Senhora, com a página da Missa. Escolha um mês no gráfico.</p>';
  h += '<div class="chart"><h3>Celebrações por mês</h3><p class="cap">Quantas datas com Missa própria o Missal traz em cada mês.</p><div class="months">' +
    cont.map((n, i) => '<button type="button" data-mes="' + (i + 1) + '" class="' + (mesSel === i + 1 ? "on" : "") + '" aria-pressed="' + (mesSel === i + 1) + '" aria-label="' + MESES_L[i] + ", " + n + ' celebrações"><span class="n">' + n + '</span><span class="col" style="height:' + Math.round((n / max) * 78) + 'px"></span><span>' + MESES[i] + "</span></button>").join("") + "</div></div>";
  const doMes = new Set<string>();
  const lista = CELEB.filter((c) => c.mes === mesSel)
    .sort((a, b) => a.dia! - b.dia! || a.pagina - b.pagina)
    .filter((c) => { const k = c.dia + "-" + c.pagina; if (doMes.has(k)) return false; doMes.add(k); return true; });
  const nomeMes = MESES_L[mesSel - 1];
  h += "<h2>" + nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1) + '</h2><div class="list">' +
    lista.map((c) => '<div class="item"><div class="txt"><div class="t">' + esc(c.nome) + '</div><div class="u">' + esc(c.data) + "</div></div>" + pg(c.pagina) + "</div>").join("") + "</div>";
  const mov = CELEB.filter((c) => !c.mes).sort((a, b) => a.pagina - b.pagina);
  h += '<details class="grp"><summary><span class="dot"></span><span class="gname"><b>Datas móveis</b><small>' + mov.length + " celebrações sem dia fixo</small></span>" + CHEV + '</summary><div class="items">' +
    mov.map((c) => '<div class="item"><div class="txt"><div class="t">' + esc(c.nome) + "</div>" + (c.data ? '<div class="u">' + esc(c.data) + "</div>" : "") + "</div>" + pg(c.pagina) + "</div>").join("") + "</div></details>";
  return h;
}

export function viewMapa(): string {
  const sel = estado.mapaSel;
  const fim = MAPA[MAPA.length - 1].ate;
  const max = Math.max(...MAPA.map((m) => m.ate - m.de + 1));
  let h = '<p class="lead">O Missal inteiro numa vista só. Cada barra é uma parte do livro, na ordem em que aparece; o tamanho mostra quantas páginas ela ocupa. Toque para ver o que há dentro.</p>';
  h += '<div class="chart"><h3>Onde cada parte fica no livro</h3><p class="cap">Da página 1 à ' + fim + '. A parte escolhida aparece em vermelho.</p><div class="strip" aria-hidden="true">' +
    MAPA.map((m, i) => '<span class="' + (i === sel ? "on" : "") + '" style="flex:' + (m.ate - m.de + 1) + ' 0 0"></span>').join("") +
    '</div><div class="stripcap"><span>pág. 1</span><span>pág. ' + fim + '</span></div><div class="bars">' +
    MAPA.map((m, i) => {
      const n = m.ate - m.de + 1;
      return '<button type="button" class="bar' + (i === sel ? " on" : "") + '" data-mapa="' + i + '" aria-pressed="' + (i === sel) + '"><span class="l">' + esc(m.nome) + '</span><span class="track"><span class="fill" style="width:' + (n / max) * 100 + '%"></span></span><span class="v">' + n + "</span></button>";
    }).join("") + "</div></div>";
  const m = MAPA[sel];
  h += "<h2>" + esc(m.nome) + '</h2><p class="lead">Páginas ' + m.de + " a " + m.ate + '.</p><div class="list">' +
    m.subitens.map((s) => '<div class="item"><div class="txt"><div class="t">' + esc(s.nome) + "</div></div>" + pg(s.pagina) + "</div>").join("") + "</div>";
  return h;
}
