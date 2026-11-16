/* O dia litúrgico: cartões do dia, roteiro do Missal, quadro no alto e caixa do calendário. */
import { diaLiturgico, paginaOE, type DiaLiturgico } from "../liturgia/dia";
import { DS, MESES_L, dataLonga, deISO, hojeISO } from "../liturgia/datas";
import { corHTML, esc, passo, pg, avisos } from "../util/html";
import { dataSel, estado } from "../estado";

/** Cartões do dia: celebração, cor, Glória e Creio, santo e avisos. */
export function diaHTML(r: DiaLiturgico, dt: Date): string {
  const t = r.tempo, s = r.santo;
  let h = "";
  h += '<article class="oe dia"><div class="head"><h3>' + esc(r.titulo) + "<small>" + esc(dataLonga(dt)) + " · " + esc(r.grau) + "</small></h3>" + (r.pagina ? pg(r.pagina) : "") + "</div>" +
    '<div class="chips">' + corHTML(r.cor[0], "Cor: " + r.cor[1]) +
    (r.semMissa ? '<span class="chip">Hoje não há Missa</span>' : '<span class="chip">Glória: ' + (r.gloria ? "sim" : "não") + '</span><span class="chip">Creio: ' + (r.creio ? "sim" : "não") + "</span>") + "</div></article>";
  if (r.modo === "m" && s) {
    h += '<article class="oe dia"><div class="head"><h3>' + esc(s.nome) + "<small>Memória do dia</small></h3>" + pg(s.pagina) +
      "</div><p>Hoje se celebra a memória: usam-se as orações do santo que estão na página dele. O que ele não tiver de próprio toma-se do Comum (p. 887–960) ou da Missa do dia, p. " + t.pagina + ".</p></article>";
  }
  const fac = r.modo === "o" ? r.outros : r.modo === "m" ? r.outros.filter((x) => x.grau !== "S" && x.grau !== "F") : [];
  if (fac.length) {
    h += '<div class="list">' + fac.map((x) =>
      '<div class="item"><div class="txt"><div class="kind">' + (r.modo === "o" ? "Memória facultativa" : "Também hoje") + '</div><div class="t">' + esc(x.nome) + '</div><div class="u">' +
      (r.modo === "o" ? "Pode-se celebrar o santo, com as orações da página dele, ou ficar com a Missa do dia." : "Quando duas memórias coincidem, celebra-se uma delas, à escolha.") + "</div></div>" + pg(x.pagina) + "</div>").join("") + "</div>";
  }
  if (r.avisos.length) h += avisos(r.avisos);
  return h;
}

const CONFIRME = '<div class="aviso"><b>Confirme com o presidente da celebração.</b> Este guia segue o calendário geral do Brasil. O padroeiro e as festas próprias da diocese ou da comunidade, uma Missa votiva ou a escolha do celebrante por outro prefácio ou Oração Eucarística podem mudar o que se usa.</div>';

export function viewRoteiro(): string {
  const dt = dataSel(), r = diaLiturgico(dt), t = r.tempo, s = r.santo;
  let h = '<p class="lead">Como deixar o Missal marcado para a Missa da data escolhida: as páginas e a ordem em que abrir. O cálculo segue o calendário do Missal para o Brasil e funciona para qualquer ano.</p>';
  h += '<p class="lead">Data: ' + esc(dataLonga(dt)) + ". Para ver outro dia, toque no quadro do dia, no alto da tela.</p>" + diaHTML(r, dt);
  if (!r.semMissa) {
    const pm = r.modo === "m" && s ? s.pagina : r.pagina;
    h += '<h2>Roteiro do Missal</h2><div class="list">' +
      passo("Ritos iniciais", 430, "Sinal da cruz, saudação e ato penitencial." + (r.gloria ? " Hoje se diz o Glória." : " Hoje não se diz o Glória."), 1) +
      passo("Missa do dia: coleta, oração sobre as oferendas e depois da comunhão", pm, r.modo === "m" ? "Página do santo. A Missa do dia, na p. " + t.pagina + ", completa o que faltar." : "Deixe a fita nesta página; volta-se a ela três vezes durante a Missa.", 2) +
      passo("Liturgia da Palavra", 443, "As leituras ficam no Lecionário, não no Missal." + (r.creio ? " Hoje se diz o Creio." : " Hoje não se diz o Creio."), 3) +
      passo("Liturgia Eucarística: preparação das oferendas", 446, "", 4) +
      passo("Prefácio: " + r.prefacio[0], r.prefacio[1], "", 5) +
      passo("Oração Eucarística recomendada", paginaOE(r), r.oracaoEucaristica, 6) +
      passo("Rito da comunhão", 569, "Pai-nosso, rito da paz, Cordeiro de Deus e comunhão.", 7) +
      passo(r.bencao[0], r.bencao[1], "Ritos finais na p. 575. As bênçãos solenes são sempre opcionais.", 8) + "</div>";
  }
  return h + CONFIRME;
}

function resumoDia(r: DiaLiturgico): string {
  if (r.modo === "m" && r.santo) return "Memória: " + r.santo.nome;
  if (r.modo === "o" && r.outros.length) return "Memória facultativa: " + r.outros[0].nome + (r.outros.length > 1 ? " e mais " + (r.outros.length - 1) : "");
  if (r.grau !== "Dia de semana") return r.grau;
  return "";
}

const ICONE_CAL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>';

/** Quadro do dia, no alto da tela. */
export function quadroDia(): { cor: string; html: string } {
  const dt = dataSel(), r = diaLiturgico(dt), hoje = estado.calSel === hojeISO();
  const curta = DS[dt.getUTCDay()].toLowerCase() + ", " + (dt.getUTCDate() === 1 ? "1º" : dt.getUTCDate()) + " de " + MESES_L[dt.getUTCMonth()];
  const m = resumoDia(r);
  return {
    cor: r.cor[0],
    html: '<span class="dk">' + (hoje ? "Hoje" : "Data escolhida") + " · " + esc(curta) + "</span><b>" + esc(r.titulo) + "</b>" + (m ? '<span class="dm">' + esc(m) + "</span>" : "") +
      '<span class="dc"><i></i>' + esc(r.cor[1]) + (r.semMissa ? " · hoje não há Missa" : " · Glória: " + (r.gloria ? "sim" : "não") + " · Creio: " + (r.creio ? "sim" : "não")) + "</span>" + ICONE_CAL,
  };
}

function ctlHTML(v: string): string {
  return '<div class="ctl"><button type="button" class="btn" data-passo="-1" aria-label="Dia anterior">‹</button><input type="date" id="dia" value="' + v + '" aria-label="Data"><button type="button" class="btn" data-passo="1" aria-label="Próximo dia">›</button><button type="button" class="btn" data-passo="0">Hoje</button></div>';
}

/** Caixa do calendário (abre ao tocar no quadro do dia). */
export function caixaHTML(): { cor: string; html: string } {
  const sel = estado.modalSel, dt = deISO(sel), r = diaLiturgico(dt), hoje = hojeISO();
  let h = "<h2>Calendário litúrgico</h2>" + ctlHTML(sel) + diaHTML(r, dt) + '<div class="acoes">';
  if (sel !== estado.calSel) h += '<button type="button" class="btn pri" data-usar="1">' + (sel === hoje ? "Voltar para hoje" : "Preparar esta data") + "</button>";
  h += '<button type="button" class="btn" data-fechar="1">Fechar</button></div>';
  if (sel !== estado.calSel && sel !== hoje) h += '<p class="lead">“Preparar esta data” faz os lembretes, o roteiro do Missal e as cores seguirem esse dia. Ao abrir o aplicativo de novo, ele volta para hoje.</p>';
  return { cor: r.cor[0], html: h };
}
