/* Junta o Próprio do Tempo e o Próprio dos Santos e decide o que se celebra num dia:
   cor, prefácio, Oração Eucarística, bênção, Glória e Creio. */
import tabelas from "../dados/calendario.json";
import type { Cor, TabelasCalendario } from "../tipos";
import { CORES } from "../util/html";
import { diaDoTempo, type DiaDoTempo } from "./tempo";
import { FESTAS_DO_SENHOR, ehMaria, santosDoDia, type SantoDoDia } from "./santos";

const CAL = tabelas as TabelasCalendario;
const SEMPRE_BRANCO = new Set(CAL.semprebranco);

/** [descrição, página(s)] */
export type Referencia = [string, string];

/**
 * t: celebra-se o dia do tempo; s: solenidade ou festa de santo no lugar do tempo;
 * m: memória obrigatória; o: dia comum com memória(s) facultativa(s) à escolha.
 */
export type Modo = "t" | "s" | "m" | "o";

export interface DiaLiturgico {
  tempo: DiaDoTempo;
  modo: Modo;
  santo?: SantoDoDia;
  outros: SantoDoDia[];
  avisos: string[];
  titulo: string;
  grau: string;
  pagina: number;
  cor: [Cor, string];
  prefacio: Referencia;
  bencao: Referencia;
  oracaoEucaristica: string;
  gloria: boolean;
  creio: boolean;
  semMissa: boolean;
}

export function corSanto(s: SantoDoDia): Cor {
  if (s.pagina === 845) return "roxo";
  if (SEMPRE_BRANCO.has(s.pagina)) return "branco";
  if (s.pagina === 738 || /mártir|Mártir|apóstolo|evangelista|Martírio|Exaltação/.test(s.nome)) return "vermelho";
  return "branco";
}

export function prefacioSanto(s: SantoDoDia): Referencia {
  const proprio = CAL.prefacioProprio[String(s.pagina)];
  if (proprio) return [s.pagina === 845 ? "Defuntos I a V" : s.pagina === 850 ? "Dedicação de uma igreja I ou II" : "Próprio da celebração", proprio];
  if (ehMaria(s)) return ["Virgem Maria I ou II", "493–494"];
  if (/apóstolo|evangelista/.test(s.nome)) return ["Apóstolos I ou II", "498–499"];
  if (/mártir|Mártir/.test(s.nome)) return ["Mártires I ou II", "502–503"];
  if (/doutor/.test(s.nome)) return ["Doutores da Igreja I ou II", "506–507"];
  if (/bispo|papa|presbítero/.test(s.nome)) return ["Pastores I ou II", "504–505"];
  if (/virgem|religios|abade|monge|eremita/.test(s.nome)) return ["Virgens e Religiosos", "508"];
  return ["Santos I ou II", "500–501"];
}

export function prefacioTempo(t: DiaDoTempo): Referencia {
  if (t.tempo === "adv") return t.fimDoAdvento ? ["Advento II ou II A", "453–454"] : ["Advento I ou I A", "451–452"];
  if (t.tempo === "nat") {
    if (t.chave === "maededeus") return ["Virgem Maria I", "493"];
    if (t.chave === "epifania") return ["Epifania do Senhor", "458"];
    if (t.chave === "batismo") return ["Próprio do Batismo do Senhor", "159"];
    if (t.depoisEpifania) return ["Epifania (p. 458) ou Natal I a III (p. 455–457)", "458"];
    return ["Natal I, II ou III", "455–457"];
  }
  if (t.tempo === "qua") {
    if (t.chave === "ramos") return ["Próprio: a Paixão do Senhor", "225"];
    if (t.semanaSanta) return ["Paixão do Senhor II", "465"];
    if (t.domingo) {
      if (t.semana === 1) return ["Próprio: a tentação do Senhor", "170"];
      if (t.semana === 2) return ["Próprio: a transfiguração do Senhor", "178"];
      const e = ({ 3: ["da Samaritana", "187"], 4: ["do cego de nascença", "196"], 5: ["de Lázaro", "204"] } as Record<number, Referencia>)[t.semana!];
      return ["Prefácio " + e[0] + " (p. " + e[1] + ") quando se lê esse Evangelho; nos outros anos, Quaresma I ou II", e[1] + " ou 459–460"];
    }
    if (t.semana === 5) return ["Paixão do Senhor I", "464"];
    return ["Quaresma III ou IV (ou outro da Quaresma, p. 459–463)", "461–462"];
  }
  if (t.tempo === "tri") return ["Santíssima Eucaristia I", "486"];
  if (t.tempo === "pas") {
    if (t.chave === "pascoa" || t.oitava) return ["Páscoa I", "466"];
    if (t.chave === "ascensao") return ["Ascensão I ou II", "471–472"];
    if (t.chave === "pentecostes") return ["Próprio de Pentecostes", "379"];
    if (t.depoisAscensao) return ["Depois da Ascensão (p. 473), Ascensão ou Páscoa", "471–473"];
    return ["Páscoa I a V", "466–470"];
  }
  if (t.chave === "trindade") return ["Próprio da Santíssima Trindade", "418"];
  if (t.chave === "corpus") return ["Santíssima Eucaristia I ou II", "486–487"];
  if (t.chave === "coracao") return ["Próprio do Sagrado Coração", "423"];
  if (t.chave === "cristorei") return ["Próprio de Cristo Rei", "426"];
  return t.domingo ? ["Domingos do Tempo Comum I a X", "474–483"] : ["Prefácio Comum I a IX", "509–517"];
}

export function corTempo(t: DiaDoTempo): [Cor, string] {
  if (t.chave === "ramos" || t.chave === "paixao" || t.chave === "pentecostes") return ["vermelho", "Vermelho"];
  if (t.chave === "ceia" || t.chave === "sabado") return ["branco", "Branco"];
  if (t.tempo === "adv") return ["roxo", t.domingo && t.semana === 3 ? "Roxo (ou rosa, no Domingo Gaudete)" : "Roxo"];
  if (t.tempo === "qua") return ["roxo", t.domingo && t.semana === 4 ? "Roxo (ou rosa, no Domingo Laetare)" : "Roxo"];
  if (t.tempo === "nat" || t.tempo === "pas" || t.solenidade) return ["branco", "Branco"];
  return ["verde", "Verde"];
}

const SIMPLES: Referencia = ["Bênção simples (ou uma oração sobre o povo, p. 589–593)", "575"];

export function bencaoTempo(t: DiaDoTempo): Referencia {
  if (t.chave === "ceia") return ["Não há bênção final: a Missa termina com a transladação do Santíssimo Sacramento", "255"];
  if (t.chave === "ramos") return ["Oração sobre o povo do dia (na página da Missa) ou bênção solene da Paixão do Senhor", "580"];
  if (t.tempo === "adv") return t.domingo ? ["Bênção solene do Advento", "578"] : SIMPLES;
  if (t.tempo === "nat") {
    if (t.chave === "maededeus") return ["Bênção solene do início do ano", "579"];
    if (t.chave === "epifania") return ["Bênção solene da Epifania", "580"];
    if (t.chave === "natal" || t.chave === "sagfam" || t.oitava) return ["Bênção solene do Natal", "579"];
    return SIMPLES;
  }
  if (t.tempo === "qua") return t.domingo ? ["Oração sobre o povo do próprio domingo (na página da Missa)", String(t.pagina)] : ["Bênção simples; a oração sobre o povo do dia, na página da Missa, é opcional", "575"];
  if (t.tempo === "pas") {
    if (t.chave === "pascoa") return ["Bênção solene da Páscoa", "312"];
    if (t.chave === "ascensao") return ["Bênção solene da Ascensão", "581"];
    if (t.chave === "pentecostes") return ["Bênção solene do Espírito Santo", "582"];
    return t.domingo || t.oitava ? ["Bênção solene do Tempo Pascal", "581"] : SIMPLES;
  }
  return t.domingo || t.solenidade ? ["Bênção solene do Tempo Comum (I a VI, à escolha)", "582–585"] : SIMPLES;
}

export function bencaoSanto(s: SantoDoDia): Referencia {
  if (s.pagina === 845) return ["Bênção solene pelos fiéis defuntos", "588"];
  if (s.pagina === 850) return ["Bênção solene da dedicação de igreja", "588"];
  if (s.pagina === 738) return ["Bênção solene de São Pedro e São Paulo", "586"];
  if (FESTAS_DO_SENHOR.has(s.pagina) || s.pagina === 692) return ["Bênção simples (ou bênção solene do Tempo Comum, p. 582–585)", "575"];
  if (ehMaria(s)) return ["Bênção solene de Nossa Senhora", "585"];
  if (/apóstolo|evangelista/.test(s.nome)) return ["Bênção solene dos Santos Apóstolos", "586"];
  return ["Bênção solene de Todos os Santos (serve para as festas dos santos)", "587"];
}

/** Monta tudo o que a tela mostra para uma data. */
export function diaLiturgico(dt: Date): DiaLiturgico {
  const t = diaDoTempo(dt);
  const sd = santosDoDia(dt);
  const L = sd.lista, avisos = sd.avisos.slice(), s = L[0];
  let modo: Modo = "t";
  let outros: SantoDoDia[] = [];

  if (s) {
    if ((s.grau === "S" || s.grau === "F") && s.precedencia < t.precedencia) { modo = "s"; outros = L.slice(1); }
    else if (s.grau === "M" && t.precedencia === 13) { modo = "m"; outros = L.slice(1); }
    else if (t.precedencia === 13) { modo = "o"; outros = L; }
    else {
      L.forEach((x) => {
        if (x.grau === "S") avisos.push("A solenidade de " + x.nome + " (p. " + x.pagina + ") coincide hoje com uma celebração de precedência igual ou maior e costuma ser transferida. Confira o diretório litúrgico.");
        else if (x.grau === "F") avisos.push("Neste ano a festa de " + x.nome + " (p. " + x.pagina + ") não é celebrada, porque a celebração de hoje tem precedência.");
        else if (t.precedencia === 9) avisos.push("A memória de " + x.nome + " (p. " + x.pagina + ") fica só como comemoração: pode-se rezar a coleta do santo, e o restante é do dia.");
        else avisos.push("A memória de " + x.nome + " (p. " + x.pagina + ") não é celebrada neste ano, porque a celebração de hoje tem precedência.");
      });
    }
  }

  const santo = modo === "s" || modo === "m";
  if (modo === "s") {
    const cor = corSanto(s);
    if (s.obs) avisos.unshift(s.obs);
    if (t.domingo || t.precedencia < 13) avisos.push("Hoje esta celebração toma o lugar de: " + t.nome + (t.pagina ? " (p. " + t.pagina + ")" : "") + ".");
    return {
      tempo: t, modo, santo: s, outros, avisos,
      titulo: s.nome, grau: s.grau === "S" ? "Solenidade" : "Festa", pagina: s.pagina,
      cor: [cor, CORES[cor]], prefacio: prefacioSanto(s), bencao: bencaoSanto(s),
      oracaoEucaristica: s.pagina === 845
        ? "II (p. 536) ou III (p. 545), com a fórmula própria pelos defuntos."
        : "III, p. 545, que permite citar o santo do dia. Nas festas dos Apóstolos cabe bem a I (Cânon Romano), p. 523.",
      gloria: s.pagina !== 845,
      creio: (s.grau === "S" && s.pagina !== 845) || !!t.domingo,
      semMissa: false,
    };
  }

  if (t.obs) avisos.unshift(t.obs);
  const r: DiaLiturgico = {
    tempo: t, modo, outros, avisos,
    titulo: t.nome, pagina: t.pagina,
    grau: t.solenidade ? "Solenidade" : t.festa ? "Festa" : t.domingo ? "Domingo" : "Dia de semana",
    cor: corTempo(t), prefacio: prefacioTempo(t), bencao: bencaoTempo(t),
    oracaoEucaristica: t.comunhaoPropria
      ? "I (Cânon Romano), p. 523: hoje ela tem o “Em comunhão” próprio. Também cabe a III, p. 545."
      : t.domingo || t.solenidade || t.festa
        ? "III, p. 545." + (t.tempo === "tc" && t.domingo && !t.solenidade ? " A IV (p. 554) também cabe, com o prefácio dela." : "")
        : "II, p. 536." + (t.tempo === "qua" ? " Na Quaresma também cabem as da Reconciliação, p. 602 e 608." : ""),
    gloria: !!(t.solenidade || t.festa || t.oitava || t.chave === "ceia" || (t.domingo && t.tempo !== "adv" && t.tempo !== "qua")),
    creio: !!(t.domingo || t.solenidade),
    semMissa: !santo && !!t.semMissa,
  };
  if (modo === "m") {
    r.santo = s;
    const cor = corSanto(s);
    r.cor = [cor, CORES[cor]];
    const ps = prefacioSanto(s), pt = prefacioTempo(t);
    r.prefacio = [ps[0] + " (p. " + ps[1] + "), ou o do tempo: " + pt[0] + " (p. " + pt[1] + ")", ps[1]];
    r.oracaoEucaristica = "II, p. 536, ou III, p. 545, que permite citar o santo do dia.";
  }
  return r;
}

/** Página da Oração Eucarística recomendada (o primeiro "p. N" do texto). */
export function paginaOE(r: DiaLiturgico): string {
  return (r.oracaoEucaristica.match(/p\. (\d+)/) || [])[1] || "";
}
