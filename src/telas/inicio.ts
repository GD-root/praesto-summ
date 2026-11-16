/* Tela inicial: só as três partes. */
import { diaLiturgico, paginaOE } from "../liturgia/dia";
import { CHEV, esc } from "../util/html";
import { dataSel, estado } from "../estado";
import { essenciais, lembretes } from "./preparacao";
import { procissao } from "./ministerios";

export function viewInicio(): string {
  const dt = dataSel(), r = diaLiturgico(dt), e = essenciais(), p = procissao(estado.corpo), L = lembretes(r, dt);
  const oePag = paginaOE(r);
  return '<div class="portas">' +
    '<a class="porta" href="#objetos"><span class="pn">1</span><span class="txt"><b>Preparação do altar</b><small>' + (e[0] === e[1] ? "Tudo pronto" : e[0] + " de " + e[1] + " itens essenciais marcados") + " · " + L.length + (L.length === 1 ? " lembrete" : " lembretes") + " do dia</small></span>" + CHEV + "</a>" +
    '<a class="porta" href="#roteiro"><span class="pn">2</span><span class="txt"><b>Missal</b><small>' + (r.semMissa ? "Celebração na p. " + r.pagina : "Missa p. " + (r.modo === "m" && r.santo ? r.santo.pagina : r.pagina) + " · Prefácio p. " + esc(r.prefacio[1]) + (oePag ? " · Oração Eucarística p. " + oePag : "")) + "</small></span>" + CHEV + "</a>" +
    '<a class="porta" href="#corpo"><span class="pn">3</span><span class="txt"><b>Ministérios</b><small>' + p.total + " pessoas na procissão" + (p.falta ? " · faltam " + p.falta + " para as funções" : "") + "</small></span>" + CHEV + "</a></div>" +
    '<p class="lead inicio-nota">Para acólitos, coroinhas e quem prepara a Santa Missa. Confirme sempre com o presidente da celebração.</p>' +
    '<div class="sobre"><p class="verso">“Servi ao Senhor com alegria.”</p><p class="ref">Salmo 100(99),2</p><p>Feito para ajudar quem dedica a vida ao serviço do altar e ama a Santa Liturgia.</p><p class="ass">GD</p></div>';
}
