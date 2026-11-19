/* Tela inicial: o cartão do dia fica no alto (quadro do dia); aqui, os três cartões das partes do guia. */
import { diaLiturgico, paginaOE } from "../liturgia/dia";
import { CHEV, esc } from "../util/html";
import { dataSel, estado } from "../estado";
import { essenciais, lembretes } from "./preparacao";
import { procissao } from "./ministerios";

const SV = (d: string) => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
const ICONE_LIVRO = SV('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"></path><path d="M4 21V5M9 7h6"></path>');
const ICONE_PESSOAS = SV('<circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.4"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.6 1.3-4.6 4-4.6 1.5 0 2 .4 2 .4"></path>');
const ORNATO = '<div class="ornato" aria-hidden="true"><i></i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v18M7 8h10"></path></svg><i></i></div>';

export function viewInicio(): string {
  const dt = dataSel(), r = diaLiturgico(dt), e = essenciais(), p = procissao(estado.corpo), L = lembretes(r, dt);
  const oePag = paginaOE(r);
  const pct = e[1] ? Math.round((e[0] / e[1]) * 100) : 0;
  const pronto = e[0] === e[1];
  const missa = r.semMissa ? r.pagina : r.modo === "m" && r.santo ? r.santo.pagina : r.pagina;
  return ORNATO + '<div class="bento">' +
    '<a class="tile lg' + (pronto ? " ok" : "") + '" href="#objetos"><span class="anel" style="--p:' + pct + '%"><i>' + e[0] + "/" + e[1] + '</i></span><span class="txt"><b>Preparação do altar</b><small>' +
      (pronto ? "Tudo pronto" : e[0] + " de " + e[1] + " itens essenciais marcados") + "<br>" + L.length + (L.length === 1 ? " lembrete" : " lembretes") + " do dia</small></span>" + CHEV + "</a>" +
    '<a class="tile" href="#roteiro"><span class="ic">' + ICONE_LIVRO + "</span><b>Missal</b>" +
      '<span class="num">' + esc(missa) + "<small>pág.</small></span><small>" + (r.semMissa ? "Celebração do dia" : "Prefácio p. " + esc(r.prefacio[1]) + (oePag ? " · Oração Eucarística p. " + oePag : "")) + "</small></a>" +
    '<a class="tile" href="#corpo"><span class="ic">' + ICONE_PESSOAS + "</span><b>Ministérios</b>" +
      '<span class="num">' + p.total + "<small>" + (p.total === 1 ? "pessoa" : "pessoas") + "</small></span><small>na procissão" + (p.falta ? " · faltam " + p.falta + " para as funções" : "") + "</small></a></div>" +
    '<p class="lead inicio-nota">Para acólitos, coroinhas e quem prepara a Santa Missa. Confirme sempre com o presidente da celebração.</p>' +
    '<div class="sobre"><p class="verso">“Servi ao Senhor com alegria.”</p><p class="ref">Salmo 100(99),2</p><p>Feito para ajudar quem dedica a vida ao serviço do altar e ama a Santa Liturgia.</p><p class="ass">GD</p></div>';
}
