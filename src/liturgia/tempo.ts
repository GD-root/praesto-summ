/* Próprio do Tempo: que dia do ano litúrgico é uma data, segundo o calendário do Missal para o Brasil. */
import tabelas from "../dados/calendario.json";
import type { TabelasCalendario } from "../tipos";
import { D, DS, ORD, advento1, dif, domAte, domDesde, igual, mais, pascoa } from "./datas";

const CAL = tabelas as TabelasCalendario;

export type Tempo = "adv" | "nat" | "qua" | "tri" | "pas" | "tc";

/** Dias com regras próprias (prefácio, cor, bênção, lembretes). */
export type Chave =
  | "natal" | "sagfam" | "maededeus" | "epifania" | "batismo"
  | "cinzas" | "ramos" | "ceia" | "paixao" | "sabado"
  | "pascoa" | "pentecostes" | "ascensao"
  | "trindade" | "corpus" | "coracao" | "cristorei";

export interface DiaDoTempo {
  tempo: Tempo;
  chave?: Chave;
  nome: string;
  /** página da Missa no Missal (0 quando não há uma página única) */
  pagina: number;
  /**
   * Precedência (tabela das Normas do Ano Litúrgico; quanto menor, mais forte):
   * 1 Tríduo; 2 dias privilegiados; 3 solenidades; 5 festas do Senhor;
   * 6 domingos do Natal e do Tempo Comum; 9 dias de semana fortes; 13 dias de semana comuns.
   */
  precedencia: number;
  semana?: number;
  domingo?: boolean;
  solenidade?: boolean;
  festa?: boolean;
  /** tem o "Em comunhão" próprio na Oração Eucarística I */
  comunhaoPropria?: boolean;
  oitava?: boolean;
  semanaSanta?: boolean;
  semMissa?: boolean;
  /** 17 a 24 de dezembro */
  fimDoAdvento?: boolean;
  depoisEpifania?: boolean;
  depoisAscensao?: boolean;
  obs?: string;
}

function paginaDaSemana(t: Record<string, number[]>, semana: number, diaDaSemana: number): number {
  return t[String(semana)][diaDaSemana];
}

export function diaDoTempo(dt: Date): DiaDoTempo {
  const y = dt.getUTCFullYear(), w = dt.getUTCDay(), dia = dt.getUTCDate(), mes = dt.getUTCMonth() + 1;
  const pa = pascoa(y), cin = mais(pa, -46), pen = mais(pa, 49), adv = advento1(y), nat = D(y, 12, 25);
  const epi = domDesde(D(y, 1, 2));
  const bat = epi.getUTCDate() >= 7 ? mais(epi, 1) : mais(epi, 7);
  let n: number, s: number;

  function tempoComum(s: number): DiaDoTempo {
    if (w === 0) return { tempo: "tc", domingo: true, precedencia: 6, semana: s, nome: s + "º Domingo do Tempo Comum", pagina: 382 + s };
    return {
      tempo: "tc", precedencia: 13, semana: s, nome: DS[w] + " da " + s + "ª semana do Tempo Comum", pagina: s === 1 ? 383 : 382 + s,
      obs: "Nos dias de semana do Tempo Comum usa-se a Missa do domingo da semana (ou outra das 34, se for melhor para a assembleia).",
    };
  }

  /* Advento e Natal */
  if (dt >= adv) {
    if (dt < nat) {
      s = Math.floor(dif(dt, adv) / 7) + 1;
      const fim = mes === 12 && dia >= 17;
      if (w === 0) return { tempo: "adv", domingo: true, precedencia: 2, semana: s, fimDoAdvento: fim, nome: ORD[s] + " Domingo do Advento", pagina: paginaDaSemana(CAL.advento, s, 0) };
      if (fim) return {
        tempo: "adv", precedencia: 9, semana: s, fimDoAdvento: true, nome: DS[w] + ", " + dia + " de dezembro (dias antes do Natal)", pagina: 100 + dia,
        obs: dia === 24 ? "Esta é a Missa da manhã. À tarde já se celebra a Missa da vigília do Natal, p. 126." : "",
      };
      return { tempo: "adv", precedencia: 13, semana: s, nome: DS[w] + " da " + s + "ª semana do Advento", pagina: paginaDaSemana(CAL.advento, s, w) };
    }
    if (dia === 25) return { tempo: "nat", chave: "natal", solenidade: true, comunhaoPropria: true, domingo: w === 0, precedencia: 2, nome: "Natal do Senhor", pagina: 126, obs: "Missa da vigília p. 126, da noite p. 128, da aurora p. 130 e do dia p. 132." };
    if (w === 0 || (nat.getUTCDay() === 0 && dia === 30)) return { tempo: "nat", chave: "sagfam", festa: true, comunhaoPropria: true, domingo: w === 0, precedencia: 5, nome: "Sagrada Família de Jesus, Maria e José", pagina: 134 };
    if (dia <= 28) return { tempo: "nat", oitava: true, comunhaoPropria: true, precedencia: 9, nome: DS[w] + " na oitava do Natal", pagina: 0 };
    return { tempo: "nat", oitava: true, comunhaoPropria: true, precedencia: 9, nome: dia - 24 + "º dia na oitava do Natal", pagina: 106 + dia };
  }
  if (dt <= bat) {
    if (mes === 1 && dia === 1) return { tempo: "nat", chave: "maededeus", solenidade: true, comunhaoPropria: true, domingo: w === 0, precedencia: 3, nome: "Santa Maria, Mãe de Deus", pagina: 138 };
    if (igual(dt, epi)) return { tempo: "nat", chave: "epifania", solenidade: true, comunhaoPropria: true, domingo: true, precedencia: 2, nome: "Epifania do Senhor", pagina: 141, obs: "No Brasil a Epifania é celebrada no domingo entre 2 e 8 de janeiro. Missa da vigília p. 142; Missa do dia p. 144." };
    if (igual(dt, bat)) return { tempo: "nat", chave: "batismo", festa: true, domingo: w === 0, precedencia: 5, nome: "Batismo do Senhor", pagina: 158 };
    return {
      tempo: "nat", precedencia: 13, depoisEpifania: dt > epi, nome: DS[w] + " do Tempo do Natal (" + (dt > epi ? "depois" : "antes") + " da Epifania)",
      pagina: [0, 146, 148, 150, 152, 154, 156][w], obs: "A Missa é escolhida pelo dia da semana; confira na página a coleta para antes ou depois da Epifania.",
    };
  }

  /* Tempo Comum antes da Quaresma */
  if (dt < cin) return tempoComum(Math.floor(dif(dt, domAte(bat)) / 7) + 1);

  /* Quaresma e Tríduo */
  if (dt < pa) {
    n = dif(dt, cin);
    if (n === 0) return { tempo: "qua", chave: "cinzas", precedencia: 2, nome: "Quarta-feira de Cinzas", pagina: 163, obs: "Omite-se o ato penitencial; a bênção e a imposição das cinzas se fazem depois da homilia." };
    if (n < 4) return { tempo: "qua", precedencia: 9, nome: DS[w] + " depois das Cinzas", pagina: [0, 167, 168, 169][n] };
    s = Math.floor((n - 4) / 7) + 1;
    if (s <= 5) {
      if (w === 0) return { tempo: "qua", domingo: true, precedencia: 2, semana: s, nome: ORD[s] + " Domingo da Quaresma", pagina: paginaDaSemana(CAL.quaresma, s, 0) };
      return { tempo: "qua", precedencia: 9, semana: s, nome: DS[w] + " da " + s + "ª semana da Quaresma", pagina: paginaDaSemana(CAL.quaresma, s, w) };
    }
    if (w === 0) return { tempo: "qua", chave: "ramos", domingo: true, precedencia: 2, nome: "Domingo de Ramos da Paixão do Senhor", pagina: 216 };
    if (w <= 3) return { tempo: "qua", semanaSanta: true, precedencia: 2, nome: DS[w] + " da Semana Santa", pagina: [0, 227, 229, 230][w] };
    if (w === 4) return { tempo: "tri", chave: "ceia", comunhaoPropria: true, precedencia: 1, nome: "Quinta-feira Santa: Missa da Ceia do Senhor", pagina: 246, obs: "Pela manhã (ou em dia próximo), o bispo celebra na catedral a Missa do Crisma, p. 232." };
    if (w === 5) return { tempo: "tri", chave: "paixao", semMissa: true, precedencia: 1, nome: "Sexta-feira da Paixão do Senhor", pagina: 257, obs: "Hoje não se celebra Missa. A Celebração da Paixão do Senhor (Liturgia da Palavra, adoração da Cruz e Comunhão) começa na p. 257." };
    return { tempo: "tri", chave: "sabado", semMissa: true, precedencia: 1, nome: "Sábado Santo", pagina: 274, obs: "Durante o dia não se celebra Missa. À noite, a Vigília Pascal começa na p. 274." };
  }

  /* Tempo Pascal */
  if (dt <= pen) {
    n = dif(dt, pa);
    if (n === 0) return { tempo: "pas", chave: "pascoa", solenidade: true, comunhaoPropria: true, domingo: true, precedencia: 1, nome: "Domingo da Páscoa na Ressurreição do Senhor", pagina: 313, obs: "A Vigília Pascal, na noite anterior, começa na p. 274. A Missa do dia está na p. 313." };
    if (n < 7) return { tempo: "pas", oitava: true, comunhaoPropria: true, precedencia: 2, nome: DS[w] + " na oitava da Páscoa", pagina: 314 + n };
    if (n === 49) return { tempo: "pas", chave: "pentecostes", solenidade: true, comunhaoPropria: true, domingo: true, precedencia: 2, nome: "Domingo de Pentecostes", pagina: 372, obs: "Missa da vigília p. 373; Missa do dia p. 378." };
    s = Math.floor(n / 7) + 1;
    if (w === 0) {
      if (s === 7) return { tempo: "pas", chave: "ascensao", solenidade: true, comunhaoPropria: true, domingo: true, precedencia: 2, nome: "Ascensão do Senhor", pagina: 355, obs: "No Brasil a Ascensão é celebrada neste domingo, no lugar do 7º Domingo da Páscoa. Missa da vigília p. 356; Missa do dia p. 358." };
      return { tempo: "pas", domingo: true, precedencia: 2, semana: s, nome: ORD[s] + " Domingo da Páscoa" + (s === 2 ? " (Divina Misericórdia)" : ""), pagina: paginaDaSemana(CAL.pascoa, s, 0) };
    }
    return { tempo: "pas", precedencia: 13, semana: s, depoisAscensao: n > 42, nome: DS[w] + " da " + s + "ª semana da Páscoa", pagina: paginaDaSemana(CAL.pascoa, s, w) };
  }

  /* Tempo Comum depois de Pentecostes */
  n = dif(dt, pen);
  if (n === 7) return { tempo: "tc", chave: "trindade", solenidade: true, domingo: true, precedencia: 3, nome: "Santíssima Trindade", pagina: 417 };
  if (n === 11) return { tempo: "tc", chave: "corpus", solenidade: true, precedencia: 3, nome: "Santíssimo Corpo e Sangue de Cristo", pagina: 420 };
  if (n === 19) return { tempo: "tc", chave: "coracao", solenidade: true, precedencia: 3, nome: "Sagrado Coração de Jesus", pagina: 422 };
  const cr = mais(adv, -7);
  if (igual(dt, cr)) return { tempo: "tc", chave: "cristorei", solenidade: true, domingo: true, precedencia: 3, nome: "Nosso Senhor Jesus Cristo, Rei do Universo", pagina: 425 };
  return tempoComum(34 - Math.floor(dif(cr, domAte(dt)) / 7));
}
